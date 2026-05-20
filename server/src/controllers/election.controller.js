const electionService = require('../services/election.service');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const { status } = req.query;
  const elections = await electionService.getElections(status);
  return res.json({ success: true, data: elections });
});

const getOne = catchAsync(async (req, res) => {
  const election = await electionService.getElectionById(req.params.id);
  return res.json({ success: true, data: election });
});

const create = catchAsync(async (req, res) => {
  const { title, description, category, startDate, endDate } = req.body;
  const election = await electionService.createElection({
    title,
    description,
    category,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });
  return res.status(201).json({ success: true, data: election });
});

const update = catchAsync(async (req, res) => {
  const election = await electionService.updateElection(req.params.id, req.body);
  return res.json({ success: true, data: election });
});

const remove = catchAsync(async (req, res) => {
  await electionService.deleteElection(req.params.id);
  return res.json({ success: true, message: 'Election deleted' });
});

const getResults = catchAsync(async (req, res) => {
  const results = await electionService.getResults(req.params.id);
  return res.json({ success: true, data: results });
});

module.exports = { getAll, getOne, create, update, remove, getResults };