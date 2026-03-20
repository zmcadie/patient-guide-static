document.addEventListener("DOMContentLoaded", () => {
  document.body.style.opacity = "1";
})

Promise.allSettled([
    customElements.whenDefined("sl-tab-group"),
    customElements.whenDefined("sl-tab-panel"),
    customElements.whenDefined("sl-tab")
  ]).then(() => {
  const nav = document.querySelector("sl-tab-group#page-nav")

  const setPageView = (page) => {
    const toShow = page
      ? page
      : location.hash
        ? location.hash.slice(1)
        : "home"
    nav.show(toShow)
  }

  nav.updateComplete.then(() => {
    const hashLocation = location.hash ? location.hash.slice(1) : "home"
    setPageView(hashLocation)
    // console.log(hashLocation)
    // history.replaceState(null, null, hashLocation)
    
    // const els = document.querySelectorAll(`[panel=${hashLocation}], [name=${hashLocation}]`)
    // els.forEach(el => { if (!el.active) el.setAttribute("active", true) })
    
    // const activeTab = document.querySelector(`sl-tab[active=true]`)
    // if (activeTab.panel !== hashLocation) setPageView()
  })
  
  window.addEventListener("hashchange", setPageView)
  
  nav.addEventListener("sl-tab-show", (event) => {
    if (event.target === event.currentTarget) {
      history.replaceState(null, null, `#${event.detail.name}`)
    }
  })
})