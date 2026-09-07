import prisma from '../utils/prisma.js';
import { verifyToken } from '../utils/jwt.js';

const VOTE_THRESHOLD = parseInt(process.env.VOTE_THRESHOLD || '10', 10);

export const createIssue = async (req, res) => {
  try {
    const { title, description, category, address, latitude, longitude } = req.body;

    if (!title || !description || !category || !address) {
      return res.status(400).json({ message: 'Title, description, category, and address are required.' });
    }

    const validCategories = ['POTHOLE', 'SEWAGE', 'GARBAGE', 'ELECTRICITY', 'WATER', 'STREETLIGHT', 'OTHER'];
    const formattedCategory = category.toUpperCase().trim();
    if (!validCategories.includes(formattedCategory)) {
      return res.status(400).json({ message: 'Invalid issue category.' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const lat = latitude ? parseFloat(latitude) : null;
    const lng = longitude ? parseFloat(longitude) : null;

    const issue = await prisma.issue.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: formattedCategory,
        address: address.trim(),
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lng) ? null : lng,
        imageUrl,
        status: 'PENDING',
        authenticity: 'UNVERIFIED',
        reporterId: req.user.id,
        statusHistory: {
          create: {
            status: 'PENDING',
            note: 'Report submitted by citizen.'
          }
        }
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true }
        },
        statusHistory: true
      }
    });

    return res.status(201).json({
      issue,
      message: 'Issue reported successfully.'
    });
  } catch (error) {
    console.error('Create Issue Error:', error);
    return res.status(500).json({ message: 'Server error while creating issue.' });
  }
};

export const getIssues = async (req, res) => {
  try {
    const { category, status, area, search, sort, myReports, myVotes } = req.query;

    const where = {};

    if (category) {
      where.category = category.toUpperCase();
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    if (area || search) {
      const queryStr = area || search;
      where.OR = [
        { title: { contains: queryStr, mode: 'insensitive' } },
        { description: { contains: queryStr, mode: 'insensitive' } },
        { address: { contains: queryStr, mode: 'insensitive' } }
      ];
    }

    // Extract current user if token present in header (optional auth)
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        currentUserId = decoded.id;
      }
    }

    if (myReports === 'true' && currentUserId) {
      where.reporterId = currentUserId;
    }

    if (myVotes === 'true' && currentUserId) {
      where.votes = {
        some: {
          userId: currentUserId
        }
      };
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'votes') {
      orderBy = { voteCount: 'desc' };
    } else if (sort === 'recent') {
      orderBy = { createdAt: 'desc' };
    }

    const issues = await prisma.issue.findMany({
      where,
      orderBy,
      include: {
        reporter: {
          select: { id: true, name: true }
        },
        votes: currentUserId ? { where: { userId: currentUserId } } : false
      }
    });

    const formattedIssues = issues.map(issue => {
      const userHasVoted = currentUserId && Array.isArray(issue.votes) ? issue.votes.length > 0 : false;
      const { votes, ...rest } = issue;
      return {
        ...rest,
        userHasVoted
      };
    });

    return res.json({ issues: formattedIssues });
  } catch (error) {
    console.error('Get Issues Error:', error);
    return res.status(500).json({ message: 'Server error retrieving issues.' });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const issueId = parseInt(req.params.id, 10);
    if (isNaN(issueId)) {
      return res.status(400).json({ message: 'Invalid issue ID.' });
    }

    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        currentUserId = decoded.id;
      }
    }

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
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
        },
        votes: currentUserId ? { where: { userId: currentUserId } } : false
      }
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    const userHasVoted = currentUserId && Array.isArray(issue.votes) ? issue.votes.length > 0 : false;
    const { votes, ...rest } = issue;

    return res.json({
      issue: {
        ...rest,
        userHasVoted
      }
    });
  } catch (error) {
    console.error('Get Issue By ID Error:', error);
    return res.status(500).json({ message: 'Server error fetching issue details.' });
  }
};

export const toggleVote = async (req, res) => {
  try {
    const issueId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (isNaN(issueId)) {
      return res.status(400).json({ message: 'Invalid issue ID.' });
    }

    const issue = await prisma.issue.findUnique({
      where: { id: issueId }
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_issueId: {
          userId,
          issueId
        }
      }
    });

    let userHasVoted = false;

    if (existingVote) {
      // Remove vote
      await prisma.vote.delete({
        where: { id: existingVote.id }
      });
      userHasVoted = false;
    } else {
      // Add vote
      await prisma.vote.create({
        data: {
          userId,
          issueId
        }
      });
      userHasVoted = true;
    }

    // Recalculate vote count
    const totalVotes = await prisma.vote.count({
      where: { issueId }
    });

    let currentStatus = issue.status;

    // Check escalation logic
    if (totalVotes >= VOTE_THRESHOLD && (currentStatus === 'PENDING' || currentStatus === 'VERIFIED')) {
      currentStatus = 'ESCALATED';

      // Check if escalation status history already exists to prevent duplicate entries
      const existingEscalationHistory = await prisma.statusHistory.findFirst({
        where: {
          issueId,
          status: 'ESCALATED'
        }
      });

      if (!existingEscalationHistory) {
        await prisma.issue.update({
          where: { id: issueId },
          data: {
            voteCount: totalVotes,
            status: 'ESCALATED',
            statusHistory: {
              create: {
                status: 'ESCALATED',
                note: `Automatically escalated: Threshold of ${VOTE_THRESHOLD} votes reached.`
              }
            }
          }
        });
      } else {
        await prisma.issue.update({
          where: { id: issueId },
          data: {
            voteCount: totalVotes,
            status: 'ESCALATED'
          }
        });
      }
    } else {
      await prisma.issue.update({
        where: { id: issueId },
        data: { voteCount: totalVotes }
      });
    }

    return res.json({
      voted: userHasVoted,
      voteCount: totalVotes,
      status: currentStatus,
      message: userHasVoted ? 'Upvote registered.' : 'Upvote removed.'
    });
  } catch (error) {
    console.error('Toggle Vote Error:', error);
    return res.status(500).json({ message: 'Server error processing vote.' });
  }
};

export const getMyDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const myReports = await prisma.issue.findMany({
      where: { reporterId: userId },
      orderBy: { createdAt: 'desc' }
    });

    const myVotedIssues = await prisma.issue.findMany({
      where: {
        votes: {
          some: { userId }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalReports = myReports.length;
    const resolvedReports = myReports.filter(i => i.status === 'RESOLVED').length;
    const activeReports = myReports.filter(i => ['PENDING', 'VERIFIED', 'IN_PROGRESS', 'ESCALATED'].includes(i.status)).length;
    const totalVotesCast = await prisma.vote.count({ where: { userId } });

    return res.json({
      stats: {
        totalReports,
        resolvedReports,
        activeReports,
        totalVotesCast
      },
      myReports,
      myVotedIssues
    });
  } catch (error) {
    console.error('Get My Dashboard Error:', error);
    return res.status(500).json({ message: 'Server error retrieving dashboard data.' });
  }
};
