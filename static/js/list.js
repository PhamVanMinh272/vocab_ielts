let list = (function() {
  let createListEndpoint = "/lists"
  let listDeletionEndpoint = "/lists"
  let listSearchEndpoint = "/search/lists"

  let callGetWordsAPI = function(listId, successHandler, failureHandler) {
    callAPI(`/lists/${listId}/words`, HTTP_GET, null, successHandler, failureHandler)
  }

  let callSearchAPI = function(listData, successHandler, failureHandler) {
    callAPI(listSearchEndpoint, HTTP_GET, listData, successHandler, failureHandler)
  }

  let callGetListAPI = function(successHandler, failureHandler) {
    callAPI('/lists', HTTP_GET, null, successHandler, failureHandler)
  }

  let callCreateListAPI = function(data, successHandler, failureHandler) {
    callAPI(createListEndpoint, HTTP_POST, data, successHandler, failureHandler)
  }

  let callDeleteListAPI = function(listId, successHandler, failureHandler) {
    callAPI(listDeletionEndpoint+`/${listId}`, HTTP_DELETE, null, successHandler, failureHandler)
  }

  return {
    callGetWordsAPI,
    callDeleteListAPI,
    callSearchAPI,
    callCreateListAPI,
    callGetListAPI
  }

})();