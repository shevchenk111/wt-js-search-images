const API_KEY = '55192474-4ac14a3eef79a9c3a5b4b0580';
const BASE_URL = 'https://pixabay.com/api/';
const DEFAULT_PER_PAGE = 40;

const apiService = {
  searchQuery: '',
  page: 1,
  perPage: DEFAULT_PER_PAGE,

  async fetchGallery() {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          key: API_KEY,
          q: this.searchQuery,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: true,
          page: this.page,
          per_page: this.perPage,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Помилка запиту:', error);
      throw error;
    }
  },

  resetPage() {
    this.page = 1;
  },

  setQuery(newQuery) {
    this.searchQuery = newQuery;
    this.resetPage();
  },

  setPage(currentPage) {
    this.page = currentPage;
  },
};