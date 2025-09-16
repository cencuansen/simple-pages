export const tableHeightCalc = (functionGroup: boolean, pagination: boolean) => {
  let parts = [
    `100vh`,
    'var(--root-header-height)',
    'var(--root-footer-height)',
  ]
  if (functionGroup) {
    parts.push('var(--single-row-header-height)')
  }
  if (pagination) {
    parts.push('var(--pagination-height)')
  }
  return `calc(${parts.join(' - ')})`
}
