const prisma = require('../config/database');

exports.apply = async (req, res) => {
  try {
    const { electionId, party, slogan, bio, candidateNumber } = req.body;
    const userId = req.user.id;

    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election || election.status !== 'UPCOMING')
      return res.status(400).json({ error: 'Election not open for applications' });

    const existing = await prisma.candidate.findUnique({ where: { userId } });
    if (existing) return res.status(400).json({ error: 'Already applied as candidate' });

    // Store candidateNumber inside party for now (or create a dedicated column later)
    const extendedParty = candidateNumber
      ? `${party} (ID: ${candidateNumber})`
      : party;

    const candidate = await prisma.candidate.create({
      data: {
        userId,
        electionId,
        party: extendedParty,
        slogan,
        bio,
      },
    });

    res.status(201).json({ candidate });
  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ error: 'Application failed' });
  }
};

exports.getMyCandidacy = async (req, res) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user.id },
      include: { election: true },
    });
    res.json({ candidate });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch candidacy' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slogan, bio, manifesto, websiteUrl, twitterHandle, instagramHandle } = req.body;

    // Check if candidate row exists for the user
    const existing = await prisma.candidate.findUnique({ where: { userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Candidate profile not found. You must apply first.' });
    }

    const candidate = await prisma.candidate.update({
      where: { userId },
      data: {
        ...(slogan !== undefined && { slogan }),
        ...(bio !== undefined && { bio }),
        ...(manifesto !== undefined && { manifesto }),
        ...(websiteUrl !== undefined && { websiteUrl }),
        ...(twitterHandle !== undefined && { twitterHandle }),
        ...(instagramHandle !== undefined && { instagramHandle }),
      },
    });

    res.json({ candidate });
  } catch (err) {
    console.error('Update candidate profile error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user.id },
      include: { election: true },
    });
    if (!candidate) return res.status(404).json({ error: 'Not a candidate' });

    const totalVotes = candidate.election.totalVotes;
    const share = totalVotes > 0 ? ((candidate.votesReceived / totalVotes) * 100).toFixed(1) : 0;
    res.json({ votesReceived: candidate.votesReceived, totalVotes, share });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load analytics' });
  }
};