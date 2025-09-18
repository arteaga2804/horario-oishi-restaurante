const Assignment = require('../models/schedule.model');
const Worker = require('../models/worker.model');

// @desc    Get payroll & hours summary
// @route   GET /api/dashboard/summary
// @access  Admin
exports.getSummary = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, error: 'Please provide a start and end date.' });
        }

        const summary = await Worker.aggregate([
            // 1. Get all workers and their assignments
            {
                $lookup: {
                    from: 'assignments',
                    localField: '_id',
                    foreignField: 'worker',
                    as: 'assignments'
                }
            },
            // 2. Create a document for each assignment, but keep workers with no assignments
            {
                $unwind: {
                    path: '$assignments',
                    preserveNullAndEmptyArrays: true
                }
            },
            // 3. Filter the assignments by date. Workers with no assignments will have a null date and will be kept.
            {
                $match: {
                    $or: [
                        { 
                            'assignments.date': { 
                                $gte: new Date(`${startDate}T00:00:00.000Z`), 
                                $lte: new Date(`${endDate}T23:59:59.999Z`) 
                            } 
                        },
                        { 'assignments.date': null }
                    ]
                }
            },
            // 4. Group by worker and calculate all metrics
            {
                $group: {
                    _id: '$_id',
                    workerName: { $first: '$name' },
                    contractedHours: { $first: '$weeklyHours' },
                    openingShifts: { $sum: { $cond: [{ $eq: ['$assignments.shift', 'opening'] }, 1, 0] } },
                    closingShifts: { $sum: { $cond: [{ $eq: ['$assignments.shift', 'closing'] }, 1, 0] } }
                }
            },
            // 5. Project the final calculated fields
            {
                $project: {
                    _id: 0,
                    workerId: '$_id',
                    workerName: 1,
                    contractedHours: 1,
                    scheduledHours: { $add: [ { $multiply: ["$openingShifts", 6] }, { $multiply: ["$closingShifts", 4] } ] },
                    overtimeHours: {
                        $let: {
                            vars: {
                                totalHours: { $add: [ { $multiply: ["$openingShifts", 6] }, { $multiply: ["$closingShifts", 4] } ] }
                            },
                            in: {
                                $cond: {
                                    if: { $gt: [ "$totalHours", "$contractedHours" ] },
                                    then: { $subtract: [ "$totalHours", "$contractedHours" ] },
                                    else: 0
                                }
                            }
                        }
                    },
                    shiftDistribution: {
                        opening: '$openingShifts',
                        closing: '$closingShifts'
                    }
                }
            },
            {
                $sort: { workerName: 1 }
            }
        ]);

        res.status(200).json({ success: true, data: summary });

    } catch (err) {
        console.error("Error getting dashboard summary:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};