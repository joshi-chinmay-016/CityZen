/*
Owned by Person 2
MODULE: Legacy Report Service Wrapper
*/

const reportService = require("../src/services/reportService");

async function getReports() {
  return reportService.getAllReports();
}

async function createReport(reportData) {
  return reportService.createReport(reportData);
}

module.exports = { getReports, createReport };
