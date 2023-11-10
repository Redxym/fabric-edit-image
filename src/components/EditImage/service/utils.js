/**
 * 下载文件
 * @param {string} filePath
 * @param {string} fileName 文件名
 */
export function downloadByUrl(filePath, fileName = null) {
  const aElement = document.createElement('a')
  aElement.setAttribute('href', filePath)
  aElement.setAttribute('target', '_self')
  if (fileName) {
    aElement.setAttribute('download', fileName)
  }
  aElement.setAttribute('style', 'display: none;')
  aElement.click()
  aElement.remove()
}
