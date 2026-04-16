const state = {
  courses: [],
  loading: false,
  error: null
}

const mutations = {
  SET_COURSES(state, courses) {
    state.courses = courses
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

const actions = {
  async fetchCourses({ commit }, params) {
    commit('SET_LOADING', true)
    try {
      const response = await this.$http.get('/courses', { params })
      commit('SET_COURSES', response.data)
      commit('SET_ERROR', null)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  filteredCourses: (state) => (filters) => {
    return state.courses.filter(course => {
      if (filters.type && course.type !== filters.type) return false
      if (filters.teacher && course.teacher !== filters.teacher) return false
      if (filters.subject && course.subject !== filters.subject) return false
      return true
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
