import axios from 'axios';

const API_URL = '/api/notas';

export const obtenerNotas = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener notas:', error);
    throw error;
  }
};

export const crearNota = async (nota) => {
  try {
    const response = await axios.post(API_URL, nota);
    return response.data;
  } catch (error) {
    console.error('Error al crear nota:', error);
    throw error;
  }
};

export const actualizarNota = async (id, nota) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, nota);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar nota:', error);
    throw error;
  }
};

export const eliminarNota = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Error al eliminar nota:', error);
    throw error;
  }
};
