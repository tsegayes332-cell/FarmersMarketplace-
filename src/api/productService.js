import apiClient from './apiClient';

const getProducts = async (params) => {
  const response = await apiClient.get('/products', { params });
  return response.data;
};

const getProductById = async (id) => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

export default { getProducts, getProductById };
