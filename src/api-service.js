const API_KEY = '23114999-e2eacec6c2d6e64493004e717';
const API_URL = 'https://pixabay.com/api/';
const IMAGE_TYPE = 'photo';
const ORIENTATION = 'horizontal';
const PER_PAGE = 12;
const DEFAULT_PAGE = 1;
const INITIAL_QUERY = '';

const fetchImages = ({ page = DEFAULT_PAGE, q = INITIAL_QUERY }) => {
  const requestData = {
    image_type: IMAGE_TYPE,
    orientation: ORIENTATION,
    key: API_KEY,
    per_page: PER_PAGE,
    page,
    q,
  };
  return fetch(`${API_URL}?${new URLSearchParams(requestData).toString()}`).then(response =>
    response.json(),
  );
};

export { fetchImages, PER_PAGE };
