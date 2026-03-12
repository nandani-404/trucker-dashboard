/**
 * Remove leftover Razorpay DOM elements that block clicks after checkout closes.
 * Call this when Razorpay modal is dismissed or when leaving a page that used Razorpay.
 */
export function cleanupRazorpayOverlay(): void {
  const remove = () => {
    document.querySelectorAll('iframe[src*="razorpay"], iframe[src*="checkout.razorpay"]').forEach((el) => {
      if (el.parentNode) el.parentNode.removeChild(el)
    })
    document.querySelectorAll('[id*="razorpay"]').forEach((el) => {
      if (el.id === 'razorpay-enlarge-global') return
      if (el.parentNode) el.parentNode.removeChild(el)
    })
    document.querySelectorAll('.razorpay-container, [class*="razorpay-checkout"]').forEach((el) => {
      if (el.parentNode) el.parentNode.removeChild(el)
    })
    document.querySelectorAll('body > div').forEach((el) => {
      const htmlEl = el as HTMLElement
      const style = window.getComputedStyle(htmlEl)
      const z = parseInt(style.zIndex || '0', 10)
      const pos = style.position
      if (pos === 'fixed' && z >= 50000 && !htmlEl.closest('#app')) {
        if (htmlEl.parentNode) htmlEl.parentNode.removeChild(htmlEl)
      }
    })
  }
  requestAnimationFrame(() => remove())
  setTimeout(remove, 100)
  setTimeout(remove, 300)
  setTimeout(remove, 600)
}
