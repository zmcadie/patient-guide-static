const showdown = require('showdown')
const {
  readFile,
  writeFile,
  readdir,
  rm,
  mkdir
} = require('fs/promises')
const converter = new showdown.Converter()

const mdToHtml = async (filePath) => {
  const markdown = await readFile(filePath, { encoding: 'utf8' })
  const html = converter.makeHtml(markdown)
  return html
}

const formatTabNav = (id, title) => `<sl-tab slot="nav" panel="${id}">${title}</sl-tab>`

const formatTabPanel = (id, content) => (
  `<sl-tab-panel name="${id}">
    <section class="guide-section">
      ${content}
    </section>
  </sl-tab-panel>`
)

const formatSection = (section) => {
  const id = section.match(/(?<=id=")(\w+)(?=")/)
  if (id && id.length) {
    const title = section.match(/(?<=<h1 .*>)(.+)(?=<\/h1>)/)[0]
    
    const nav = formatTabNav(id, title)
    const panel = formatTabPanel(id, section)
    
    return { nav, panel }
  }
}

const formatGuide = async (fileName) => {
  const mdPath = `./content/${fileName}.md`
  const guideHtml = await mdToHtml(mdPath).then(html => html.replaceAll(/>\s*\[i\]/g, "class='info-callout'>"))

  const sections = guideHtml.split(/[^^](?=<h1)/g)
  const {
    tabs,
    panels
  } = sections.reduce((acc, cur, i) => {
    const section = formatSection(cur)
    if (section) {
      acc.tabs.push(section.nav)
      acc.panels.push(section.panel)
    }
    return acc
  }, { tabs: [], panels: []})

  return (
    `<sl-tab-group id="guide-content" placement="start">
      ${tabs.join("\n")}
      ${panels.join("\n")}
    </sl-tab-group>`
  )
}

const updateGuideContent = async () => {
  const fileName = "guide_content"
  const [
    indexHtml,
    guideContent
  ] = await Promise.all([
    readFile("./index.html", { encoding: "utf8" }),
    formatGuide(fileName)
  ])

  const updatedIndex = indexHtml.replace(/\[guide content\]/, guideContent)
  
  await Promise.all([
    writeFile(`./dist/${fileName}.html`, guideContent, { encoding: "utf8" }),
    writeFile(`./dist/index.html`, updatedIndex, { encoding: "utf8" })
  ])

  return updatedIndex
}

const loaddir = async (dir) => {
  await mkdir(`./dist/${dir}`, { recursive: true})
  const filenames = await readdir(dir)
  await Promise.all(filenames.map(async filename => {
    const file = await readFile(`${dir}/${filename}`, { encoding: "utf8" })
    await writeFile(`./dist/${dir}/${filename}`, file, { encoding: "utf8" })
  }))
}

const loadAssets = async () => {
  await rm("./dist", { recursive: true, force: true })
  await mkdir("./dist", { recursive: true})
  await Promise.all([
    updateGuideContent(),
    loaddir("js"),
    loaddir("css"),
    loaddir("images")
  ])
}

loadAssets()