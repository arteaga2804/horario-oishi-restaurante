const Assignment = require('../models/schedule.model');
const ScheduleHistory = require('../models/scheduleHistory.model');
const Worker = require('../models/worker.model');
const Role = require('../models/role.model');
const Config = require('../models/config.model');

// Helper function to get role by ID or code
const getRoleByIdOrCode = (roles, identifier) => {
  return roles.find(r => r._id.toString() === identifier || r.code === identifier);
};

// @desc    Get schedule for a week
// @route   GET /api/schedule
// @access  Public
exports.getSchedule = async (req, res, next) => {
  try {
    // Calculate current weekId to filter by
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    const weekId = `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;

    const assignments = await Assignment.find({ weekId: weekId })
      .populate('role')
      .populate({
        path: 'worker',
        populate: {
          path: 'primaryRole secondaryRole tertiaryRole',
          model: 'Role'
        }
      });
      
    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};


// @desc    Generate schedule
// @route   POST /api/schedule/generate
// @access  Public
exports.generateSchedule = async (req, res, next) => {
  try {
    // --- 1. Fetch all necessary data ---
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    const weekId = `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;

    // --- NEW: Date calculation setup ---
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0=Sunday
    const sundayOfThisWeek = new Date(today);
    sundayOfThisWeek.setDate(today.getDate() - currentDayOfWeek);
    sundayOfThisWeek.setHours(0, 0, 0, 0);

    const workers = await Worker.find().populate('primaryRole secondaryRole tertiaryRole');
    const roles = await Role.find();
    const configDoc = await Config.findOne();
    const dailyStaffConfig = configDoc ? configDoc.dailyStaffConfig : [
      { day: 'Domingo', opening: 5, closing: 5, demand: 'Bajo' },
      { day: 'Lunes', opening: 5, closing: 5, demand: 'Bajo' },
      { day: 'Martes', opening: 5, closing: 5, demand: 'Bajo' },
      { day: 'Miércoles', opening: 5, closing: 5, demand: 'Bajo' },
      { day: 'Jueves', opening: 5, closing: 5, demand: 'Bajo' },
      { day: 'Viernes', opening: 7, closing: 7, demand: 'Alto' },
      { day: 'Sábado', opening: 7, closing: 7, demand: 'Alto' },
    ];

    if (!roles || roles.length === 0) {
        return res.status(400).json({ success: false, error: "No hay roles definidos." });
    }

    // --- 2. Initialize state ---
    const newSchedule = {};
    const workerHours = {};
    workers.forEach(worker => { workerHours[worker._id] = 0; });
    for (let day = 0; day < 7; day++) {
        newSchedule[day] = { opening: [], closing: [] };
    }
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const hoursByShift = { opening: 6, closing: 4 };

    // --- 3. Phase 1: Mandatory CJ Role Assignment ---
    const cjRole = roles.find(r => r.code === 'CJ');

    if (!cjRole) {
        return res.status(400).json({
            success: false,
            error: "El rol obligatorio 'CJ' debe estar definido."
        });
    }

    const primaryCashiers = workers.filter(w => w.primaryRole?._id.toString() === cjRole._id.toString());
    const backupCashiers = workers.filter(w => w.primaryRole?._id.toString() !== cjRole._id.toString() && (w.secondaryRole?._id.toString() === cjRole._id.toString() || w.tertiaryRole?._id.toString() === cjRole._id.toString()));

    for (let day = 0; day < 7; day++) {
        for (const shift of ['opening', 'closing']) {
            // Check if a cashier is already assigned
            if (newSchedule[day][shift].some(a => a.role.toString() === cjRole._id.toString())) {
                continue;
            }

            let assignedCashier = false;

            // Try to assign a primary cashier first
            for (const worker of primaryCashiers) {
                const isAvailable = !worker.daysOff.includes(day) &&
                                  (workerHours[worker._id] + hoursByShift[shift]) <= worker.weeklyHours &&
                                  !newSchedule[day][shift].some(a => a.worker.toString() === worker._id.toString());
                if (isAvailable) {
                    newSchedule[day][shift].push({
                        worker: worker._id, role: cjRole._id,
                        workerName: worker.name, roleName: cjRole.name, roleCode: cjRole.code, color: cjRole.color
                    });
                    workerHours[worker._id] += hoursByShift[shift];
                    assignedCashier = true;
                    break;
                }
            }

            if (assignedCashier) continue;

            // If no primary cashier was available, try backup cashiers
            for (const worker of backupCashiers) {
                const isAvailable = !worker.daysOff.includes(day) &&
                                  (workerHours[worker._id] + hoursByShift[shift]) <= worker.weeklyHours &&
                                  !newSchedule[day][shift].some(a => a.worker.toString() === worker._id.toString());
                if (isAvailable) {
                    newSchedule[day][shift].push({
                        worker: worker._id, role: cjRole._id,
                        workerName: worker.name, roleName: cjRole.name, roleCode: cjRole.code, color: cjRole.color
                    });
                    workerHours[worker._id] += hoursByShift[shift];
                    assignedCashier = true;
                    break;
                }
            }
        }
    }


    // --- 4. Phase 2: Full-Time Worker Base Schedule (10h days) ---
    const fullTimeWorkers = workers.filter(w => w.contractType === 'Tiempo Completo');

    for (const worker of fullTimeWorkers) {
        let tenHourDays = 0;
        let fourHourAssigned = false;

        for (let day = 0; day < 7; day++) {
            if (worker.daysOff.includes(day)) continue;

            // 5 días de 10h
            if (tenHourDays < 5) {
                const canAssignOpening = newSchedule[day].opening.length < dailyStaffConfig[day].opening;
                const canAssignClosing = newSchedule[day].closing.length < dailyStaffConfig[day].closing;
                const isAlreadyAssigned = newSchedule[day].opening.some(a => a.worker.toString() === worker._id.toString()) || newSchedule[day].closing.some(a => a.worker.toString() === worker._id.toString());

                if (canAssignOpening && canAssignClosing && !isAlreadyAssigned && (workerHours[worker._id] + 10) <= 54) {
                    const roleToAssign = getRoleByIdOrCode(roles, worker.primaryRole);

                    if(roleToAssign){
                        newSchedule[day].opening.push({ worker: worker._id, role: roleToAssign._id,
                            workerName: worker.name, roleName: roleToAssign.name, roleCode: roleToAssign.code, color: roleToAssign.color });
                        newSchedule[day].closing.push({ worker: worker._id, role: roleToAssign._id,
                            workerName: worker.name, roleName: roleToAssign.name, roleCode: roleToAssign.code, color: roleToAssign.color });

                        workerHours[worker._id] += 10;
                        tenHourDays++;
                        continue;
                    }
                }
            }

            // 1 día de 4h (preferimos en turno de cierre)
            if (!fourHourAssigned) {
                const shift = 'closing';
                const isAlreadyAssigned = newSchedule[day][shift].some(a => a.worker.toString() === worker._id.toString());
                if (newSchedule[day][shift].length < dailyStaffConfig[day][shift] && !isAlreadyAssigned && (workerHours[worker._id] + 4) <= 54) {
                    const roleToAssign = getRoleByIdOrCode(roles, worker.primaryRole);

                    if(roleToAssign){
                        newSchedule[day][shift].push({ worker: worker._id, role: roleToAssign._id,
                            workerName: worker.name, roleName: roleToAssign.name, roleCode: roleToAssign.code, color: roleToAssign.color });

                        workerHours[worker._id] += 4;
                        fourHourAssigned = true;
                    }
                }
            }
        }
    }
    // --- 5. Medio Tiempo (26h: 4 días de 4h + 1 día de 10h) ---
    const partTimeWorkers = workers.filter(w => w.contractType.includes('Part Time'));

    for (const worker of partTimeWorkers) {
        let fourHourDays = 0;
        let tenHourAssigned = false;

        for (let day = 0; day < 7; day++) {
            if (worker.daysOff.includes(day)) continue;

            

            // 4 días de 4h
            if (fourHourDays < 4) {
                const shift = worker.contractType === 'Part Time Dia' ? 'opening' : 'closing';
                const isAlreadyAssigned = newSchedule[day][shift].some(a => a.worker.toString() === worker._id.toString());
                if (newSchedule[day][shift].length < dailyStaffConfig[day][shift] && !isAlreadyAssigned && (workerHours[worker._id] + 4) <= 26) {
                    const roleToAssign = getRoleByIdOrCode(roles, worker.primaryRole);

                    if(roleToAssign){
                        newSchedule[day][shift].push({ worker: worker._id, role: roleToAssign._id,
                            workerName: worker.name, roleName: roleToAssign.name, roleCode: roleToAssign.code, color: roleToAssign.color });

                        workerHours[worker._id] += 4;
                        fourHourDays++;
                    }
                }
            }
        }
    }
    // --- 5. Phase 3 & 4: Fill remaining gaps and complete hours ---
    for (let i = 0; i < 15; i++) { // More iterations for better convergence
        for (let day = 0; day < 7; day++) {
            for (const shift of ['opening', 'closing']) {
                const staffNeeded = dailyStaffConfig[day][shift];
                
                while (newSchedule[day][shift].length < staffNeeded) {
                    const assignedWorkerIds = new Set(newSchedule[day][shift].map(a => a.worker.toString()));
                    
                    const potentialWorkers = workers.filter(w => {
                        const hoursForThisShift = hoursByShift[shift];
                        if (w.daysOff.includes(day)) return false;
                        if (assignedWorkerIds.has(w._id.toString())) return false;
                        if ((workerHours[w._id] + hoursForThisShift) > w.weeklyHours) return false;
                        
                        // New logic here
                        if (shift === 'opening' && w.contractType === 'Part Time Noche') return false;
                        if (shift === 'closing' && w.contractType === 'Part Time Dia') return false;

                        return true;
                    }).sort((a, b) => (workerHours[a._id] / a.weeklyHours) - (workerHours[b._id] / b.weeklyHours));

                    if (potentialWorkers.length === 0) break;

                    const assignedRoleIds = new Set(newSchedule[day][shift].map(a => a.role.toString()));
                    const neededRoles = roles.filter(r => !assignedRoleIds.has(r._id.toString()));
                    
                    let assigned = false;
                    for (const role of neededRoles) {
                        for (const worker of potentialWorkers) {
                            const workerRoles = [worker.primaryRole?._id, worker.secondaryRole?._id, worker.tertiaryRole?._id].filter(Boolean).map(r => r.toString());
                            if (workerRoles.includes(role._id.toString())) {
                                newSchedule[day][shift].push({
                                    worker: worker._id, role: role._id,
                                    workerName: worker.name, roleName: role.name, roleCode: role.code, color: role.color
                                });
                                workerHours[worker._id] += hoursByShift[shift];
                                assigned = true;
                                break;
                            }
                        }
                        if (assigned) break;
                    }

                    

                    if (!assigned) {
                        break; 
                    }
                }
            }
        }
    }

    // --- 6. Final step: Save to database ---
    const assignmentsToSave = [];
    for (const dayIndex in newSchedule) {
      for (const shiftType of ['opening', 'closing']) {
        for (const assignment of newSchedule[dayIndex][shiftType]) {
          
          const assignmentDate = new Date(sundayOfThisWeek);
          assignmentDate.setDate(sundayOfThisWeek.getDate() + parseInt(dayIndex));

          assignmentsToSave.push({
            worker: assignment.worker,
            role: assignment.role,
            day: parseInt(dayIndex),
            date: assignmentDate, // Add date
            shift: shiftType,
            weekId: weekId,
          });
        }
      }
    }

    // Instead of deleting, we will create a new history record
    if (assignmentsToSave.length > 0) {
        // Insert the new assignments
        const insertedAssignments = await Assignment.insertMany(assignmentsToSave);

        // Get the IDs of the newly created assignments
        const insertedIds = insertedAssignments.map(a => a._id);

        // Create a history record pointing to these new assignments
        await ScheduleHistory.create({
            weekId,
            generatedBy: req.user.id,
            assignments: insertedIds,
            dailyStaffConfig: dailyStaffConfig, // Snapshot of config
            weeklyHours: workerHours, // Snapshot of hours
        });
    }

    res.status(201).json({ success: true, message: 'Schedule generated and recorded in history', data: assignmentsToSave, weeklyHours: workerHours });

  } catch (err) {
    console.error("Error generating schedule:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update a single assignment
// @route   PUT /api/schedule/:id
// @access  Public
exports.updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('worker').populate('role');

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'No assignment found' });
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Swap workers between two assignments
// @route   POST /api/schedule/swap
// @access  Public
exports.swapAssignments = async (req, res, next) => {
  const { assignmentA_id, assignmentB_id } = req.body;

  try {
    const assignmentA = await Assignment.findById(assignmentA_id);
    const assignmentB = await Assignment.findById(assignmentB_id);

    if (!assignmentA || !assignmentB) {
      return res.status(404).json({ success: false, error: 'One or both assignments not found' });
    }

    const workerA_id = assignmentA.worker;
    const workerB_id = assignmentB.worker;

    // Swap workers
    await Assignment.findByIdAndUpdate(assignmentA_id, { worker: workerB_id });
    await Assignment.findByIdAndUpdate(assignmentB_id, { worker: workerA_id });

    res.status(200).json({ success: true, message: 'Swap successful' });

  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create a single assignment
// @route   POST /api/schedule
// @access  Public
exports.createAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.create(req.body);
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete a single assignment
// @route   DELETE /api/schedule/:id
// @access  Admin
exports.deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'No assignment found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};