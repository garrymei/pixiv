import Taro from '@tarojs/taro'
import { RequestError, ensureToken, getAuthHeader, isMockMode, mockResponse, resolveApiUrl, resolveAssetUrl, unwrapResponseData } from './request'

export async function uploadImage(filePath: string): Promise<{ url: string }> {
  if (isMockMode()) {
    return mockResponse({ url: filePath })
  }

  try {
    const token = await ensureToken()
    const response = await Taro.uploadFile({
      url: resolveApiUrl('/uploads/image'),
      filePath,
      name: 'file',
      header: {
        ...getAuthHeader(token)
      }
    })

    let data: any = null
    try {
      data = JSON.parse(response.data || '{}')
    } catch {
      throw new RequestError('上传返回格式异常')
    }

    const result = unwrapResponseData<{ url: string }>({
      statusCode: response.statusCode,
      data
    })
    const url = result?.url || ''
    if (!url) {
      throw new RequestError('上传成功但未返回图片地址')
    }
    return { url: resolveAssetUrl(url) }
  } catch (error: any) {
    if (error instanceof RequestError) throw error
    throw new RequestError(error?.errMsg || error?.message || '图片上传失败，请重试')
  }
}
