import prisma from '../utils/prisma.js';

export const getAdminIssues = async (req, res) => {
  try {
    const { status, category, minVotes, search, date } = req.query;

    const where = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (category) {
      where.category = category.toUpperCase();
    }

    if (minVotes) {
      const votes = parseInt(minVotes, 10);
      if (!isNaN(votes)) {
        where.voteCount = { gte: votes };
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { reporter: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (date) {
      const startDate = new Date(date);
      if (!isNaN(startDate.getTime())) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        where.createdAt = {
          gte: startDate,
          lt: endDate
        };
      }
    }

    const issues = await prisma.issue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: { id: true, name: true, email: true }
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: {
            changedByAdmin: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    return res.json({ issues });
  } catch (error) {
    console.error('Get Admin Issues Error:', error);
    return res.status(500).json({ message: 'Server error retrieving admin issues.' });
  }
};

export const updateAdminIssue = async (req, res) => {
  try {
    const issueId = parseInt(req.params.id, 10);
    if (isNaN(issueId)) {
      return res.status(400).json({ message: 'Invalid issue ID.' });
    }

    const { status, authenticity, note } = req.body;

    const issue = await prisma.issue.findUnique({
      where: { id: issueId }
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    const validStatuses = ['PENDING', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'ESCALATED'];
    const validAuthenticity = ['UNVERIFIED', 'VERIFIED', 'SPAM'];

    let targetStatus = issue.status;
    let targetAuthenticity = issue.authenticity;

    if (status) {
      const formattedStatus = status.toUpperCase().trim();
      if (!validStatuses.includes(formattedStatus)) {
        return res.status(400).json({ message: 'Invalid status value.' });
      }
      targetStatus = formattedStatus;
    }

    if (authenticity) {
      const formattedAuth = authenticity.toUpperCase().trim();
      if (!validAuthenticity.includes(formattedAuth)) {
        return res.status(400).json({ message: 'Invalid authenticity value.' });
      }
      targetAuthenticity = formattedAuth;
    }

    // Require reason note if rejecting
    if (targetStatus === 'REJECTED' && (!note || !note.trim())) {
      return res.status(400).json({ message: 'A rejection reason note is required when rejecting an issue.' });
    }

    const isStatusChanged = status && targetStatus !== issue.status;

    const updateData = {
      status: targetStatus,
      authenticity: targetAuthenticity
    };

    if (isStatusChanged || (note && note.trim())) {
      updateData.statusHistory = {
        create: {
          status: targetStatus,
          note: note ? note.trim() : `Status updated to ${targetStatus} by Admin.`,
          changedByAdminId: req.user.id
        }
      };
    }

    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: updateData,
      include: {
        reporter: {
          select: { id: true, name: true, email: true }
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: {
            changedByAdmin: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    return res.json({
      issue: updatedIssue,
      message: 'Issue updated successfully.'
    });
  } catch (error) {
    console.error('Update Admin Issue Error:', error);
    return res.status(500).json({ message: 'Server error updating issue.' });
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    const totalIssues = await prisma.issue.count();
    const totalUsers = await prisma.user.count();
    const totalVotes = await prisma.vote.count();

    // Category distribution
    const categories = ['POTHOLE', 'SEWAGE', 'GARBAGE', 'ELECTRICITY', 'WATER', 'STREETLIGHT', 'OTHER'];
    const categoryCounts = {};
    for (const cat of categories) {
      categoryCounts[cat] = await prisma.issue.count({ where: { category: cat } });
    }

    // Status distribution
    const statuses = ['PENDING', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'ESCALATED'];
    const statusCounts = {};
    for (const st of statuses) {
      statusCounts[st] = await prisma.issue.count({ where: { status: st } });
    }

    // Area distribution (top 5 area addresses)
    const issues = await prisma.issue.findMany({ select: { address: true } });
    const areaMap = {};
    issues.forEach(i => {
      const areaPart = i.address.split(',')[0].trim();
      areaMap[areaPart] = (areaMap[areaPart] || 0) + 1;
    });
    const areaCounts = Object.entries(areaMap)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Vote distribution
    const zeroVotes = await prisma.issue.count({ where: { voteCount: 0 } });
    const oneToFour = await prisma.issue.count({ where: { voteCount: { gte: 1, lte: 4 } } });
    const fiveToNine = await prisma.issue.count({ where: { voteCount: { gte: 5, lte: 9 } } });
    const tenPlus = await prisma.issue.count({ where: { voteCount: { gte: 10 } } });

    const voteDistribution = {
      '0 votes': zeroVotes,
      '1–4 votes': oneToFour,
      '5–9 votes': fiveToNine,
      '10+ votes': tenPlus
    };

    const resolutionRate = totalIssues > 0 ? Math.round(((statusCounts['RESOLVED'] || 0) / totalIssues) * 100) : 0;

    return res.json({
      summary: {
        totalIssues,
        totalUsers,
        totalVotes,
        resolutionRate
      },
      byCategory: categoryCounts,
      byStatus: statusCounts,
      byArea: areaCounts,
      voteDistribution
    });
  } catch (error) {
    console.error('Get Admin Analytics Error:', error);
    return res.status(500).json({ message: 'Server error compiling analytics.' });
  }
};
