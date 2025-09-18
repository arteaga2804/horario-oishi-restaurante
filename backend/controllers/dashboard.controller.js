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
            {
                $lookup: {
                    from: 'assignments',
                    localField: '_id',
                    foreignField: 'worker',
                    // Filter assignments by date range within the lookup pipeline
                    pipeline: [
                        {
                            $match: {
                                date: {
                                    $gte: new Date(`${startDate}T00:00:00.000Z`),
                                    $lte: new Date(`${endDate}T23:59:59.999Z`),
                                }
                            }
                        }
                    ],
                    as: 'assignments'
                }
            },
            {
                $project: {
                    name: 1,
                    weeklyHours: 1,
                    // Pre-calculate shift counts for clarity
                    openingShifts: {
                        $size: {
                            $filter: { input: "$assignments", as: "shift", cond: { $eq: [ "$shift.shift", "opening" ] } }
                        }
                    },
                    closingShifts: {
                        $size: {
                            $filter: { input: "$assignments", as: "shift", cond: { $eq: [ "$shift.shift", "closing" ] } }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    workerId: '$_id',
                    workerName: '$name',
                    contractedHours: '$weeklyHours',
                    scheduledHours: { $add: [ { $multiply: ["$openingShifts", 6] }, { $multiply: ["$closingShifts", 4] } ] },
                    overtimeHours: {
                        $let: {
                            vars: {
                                totalHours: { $add: [ { $multiply: ["$openingShifts", 6] }, { $multiply: ["$closingShifts", 4] } ] }
                            },
                            in: {
                                $cond: {
                                    if: { $gt: [ "$totalHours", "$weeklyHours" ] },
                                    then: { $subtract: [ "$totalHours", "$weeklyHours" ] },
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