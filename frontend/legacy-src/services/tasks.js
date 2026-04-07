import { request } from '../api';

export function listTasks() {
  return request('/tasks');
}

export function getTask(taskId) {
  return request(`/tasks/${taskId}`);
}

export function createTask(payload) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateTask(taskId, patch) {
  return request(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(patch)
  });
}

