export function buildSuccess<T>(data: T, message = 'Request successful') {
  return { success: true, data, message }
}

export function buildError(message: string, data: null = null) {
  return { success: false, data, message }
}
