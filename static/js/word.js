let word = (function() {
  let callGetWordAPI = function(vietId, successHandler, failureHandler) {
    callAPI(`/words/${vietId}`, HTTP_GET, null, successHandler, failureHandler)
  }

  let callCreateWordAPI = function(listId, words, successHandler, failureHandler) {
    callAPI(`/lists/${listId}/words`, HTTP_POST, words, successHandler, failureHandler)
  }

  let callUpdateWordAPI = function(vietId, data, successHandler, failureHandler) {
    callAPI(`/words/${vietId}`, HTTP_PUT, data, successHandler, failureHandler)
  }

  let callDeleteWordAPI = function(vietId, successHandler, failureHandler) {
    callAPI(`/words/${vietId}`, HTTP_DELETE, null, successHandler, failureHandler)
  }

  let callGetLessonAPI = function(listId, data, successHandler, failureHandler) {
    callAPI(`/lists/${listId}/words`, HTTP_GET, data, successHandler, failureHandler)
  }
  
  let callCheckVocabAPI = function(vietnameseId, data, successHandler, failureHandler) {
    callAPI(`/words/${vietnameseId}/check-vocab`, HTTP_GET, data, successHandler, failureHandler)
  }

  return {
    callUpdateWordAPI,
    callCreateWordAPI,
    callGetWordAPI,
    callDeleteWordAPI,
    callGetLessonAPI,
    callCheckVocabAPI
  }
})();