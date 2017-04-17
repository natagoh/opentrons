module.exports = {
  addHrefs,
  getFakeUserID,
  getUserEmail,
  getUserId,
  getUserProfile,
  isAuthenticated,
  processProtocol,
  processTasks
}

import uuidV4 from 'uuid/v4'

function addHrefs (tasks) {
  tasks.map((instrument) => {
    instrument.href = '/calibrate/' + instrument.axis
    instrument.placeables.map((placeable) => {
      placeable.href = '/calibrate/' + instrument.axis + '/' + placeable.slot + '/' + placeable.label
    })
  })
}

/*
 * Returns a random UUID for the current user and stores it in localStorage
 * Local storage is persisted throughout application updates.
 */
function getFakeUserID () {
  if (!localStorage.getItem('fakeUserID')) {
    localStorage.setItem('fakeUserID', uuidV4())
  }
  return localStorage.getItem('fakeUserID')
}

function getUserId () {
  return getUserProfile().user_id || getFakeUserID()
}

function getUserEmail () {
  return getUserProfile().email || getFakeUserID() + '@opentrons.com'
}

function getUserProfile () {
  return JSON.parse(localStorage.getItem('profile') || '{}')
}

function isAuthenticated () {
  const profile = localStorage.getItem('profile')
  const idToken = localStorage.getItem('id_token')
  if (profile == null) return false
  if (idToken == null) return false
  return true
}

function processProtocol (response) {
  let result = {success: true, errors: [], warnings: [], calibrations: []}
  console.log(response)
  let data = response.body.data
  result.calibrations = data.calibrations || []
  if (data.errors && data.errors.length > 0) {
    result.success = false
    result.errors = data.errors
  }
  result.fileName = data.fileName
  result.lastModified = data.lastModified
  return result
}

function processTasks (result, commit) {
  let tasks = result.calibrations
  let fileName = result.fileName
  let lastModified = result.lastModified
  addHrefs(tasks)
  commit('UPDATE_FILE_NAME', {'fileName': fileName})
  commit('UPDATE_FILE_MODIFIED', {'lastModified': lastModified})
  return tasks
}
