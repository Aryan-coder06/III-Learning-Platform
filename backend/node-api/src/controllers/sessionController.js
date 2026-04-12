const {
  startSession,
  appendTranscript,
  getLiveInsights,
  endSessionAndAnalyze,
  listSessionsForUser,
  listProgressUpdatesForUser,
  decideProgressUpdate,
} = require("../services/session.service");

exports.startSession = async (req, res) => {
  try {
    const session = await startSession(req.body || {});
    res.status(201).json(session);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.appendTranscript = async (req, res) => {
  try {
    const session = await appendTranscript(req.params.sessionId, req.body || {});
    res.json(session);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.endSession = async (req, res) => {
  try {
    const result = await endSessionAndAnalyze(req.params.sessionId, req.body || {});
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.getLiveInsights = async (req, res) => {
  try {
    const insights = await getLiveInsights(req.params.sessionId, req.body || {});
    res.json(insights);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.listMySessions = async (req, res) => {
  try {
    const userId = `${req.query.user_id || ""}`.trim();
    if (!userId) {
      return res.status(400).json({ error: "user_id is required." });
    }

    const sessions = await listSessionsForUser(userId, Number(req.query.limit || 20));
    return res.json(sessions);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
};

exports.listMyProgress = async (req, res) => {
  try {
    const userId = `${req.query.user_id || ""}`.trim();
    if (!userId) {
      return res.status(400).json({ error: "user_id is required." });
    }

    const decisionStatus = req.query.decision_status
      ? `${req.query.decision_status}`.trim()
      : undefined;
    const progressUpdates = await listProgressUpdatesForUser(userId, decisionStatus);
    return res.json(progressUpdates);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
};

exports.decideProgress = async (req, res) => {
  try {
    const result = await decideProgressUpdate(req.params.progressUpdateId, req.body || {});
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};
