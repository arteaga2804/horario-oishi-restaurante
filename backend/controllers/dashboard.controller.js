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

        const summary = await Assignment.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    }
                }
            },
            {
                $lookup: {
                    from: 'workers',
                    localField: 'worker',
                    foreignField: '_id',
                    as: 'workerInfo'
                }
            },
            {
                $unwind: '$workerInfo'
            },
            {
                $group: {
                    _id: '$workerInfo._id',
                    workerName: { $first: '$workerInfo.name' },
                    contractedHours: { $first: '$workerInfo.weeklyHours' }, // Note: This is weekly, dashboard might need monthly
                    scheduledHours: { $sum: { $cond: [ { $eq: ['$shift', 'opening'] }, 6, 4 ] } },
                    shifts: { $push: '$shift' }
                }
            },
            {
                $project: {
                    _id: 0,
                    workerId: '$_id',
                    workerName: 1,
                    contractedHours: 1,
                    scheduledHours: 1,
                    overtimeHours: {
                        $cond: { 
                            if: { $gt: [ "$scheduledHours", "$contractedHours" ] }, 
                            then: { $subtract: [ "$scheduledHours", "$contractedHours" ] }, 
                            else: 0 
                        }
                    },
                    shiftDistribution: {
                        opening: {
                            $size: {
                                $filter: { input: "$shifts", as: "shift", cond: { $eq: [ "$$shift", "opening" ] } }
                            }
                        },
                        closing: {
                            $size: {
                                $filter: { input: "$shifts", as: "shift", cond: { $eq: [ "$$shift", "closing" ] } }
                            }
                        }
                    }
                }
            }
        ]);

        res.status(200).json({ success: true, data: summary });

    } catch (err) {
        console.error("Error getting dashboard summary:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};