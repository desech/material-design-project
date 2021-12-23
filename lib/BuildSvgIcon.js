const fs = require('fs')
const File = require('./File.js')
const ExtendJS = require('./ExtendJS.js')

module.exports = {
  _fromDir: './material-design-icons/src',
  _toDir: './project/component/icon',
  _ref: 'e000icon',

  buildIcons () {
    console.info('Wipe icons folder')
    File.deleteDir(this._toDir)
    const folders = fs.readdirSync(this._fromDir, { withFileTypes: true })
    for (const entry of folders) {
      if (!entry.isDirectory()) continue
      this.createMainFolder(entry.name)
      this.createFolderComponents(entry.name)
    }
    this.buildIconPreview()
  },

  createMainFolder (name) {
    console.info('Create folder ' + this.sanitizeName(name))
    const folder = File.resolve(this._toDir, this.sanitizeName(name))
    File.createMissingDir(folder)
  },

  sanitizeName (name) {
    return name.replace(/[^a-z0-9-]/g, '-')
  },

  createFolderComponents (mainFolder) {
    const mainFolderPath = File.resolve(this._fromDir, mainFolder)
    const folders = fs.readdirSync(mainFolderPath, { withFileTypes: true })
    for (const folder of folders) {
      this.createComponent(mainFolder, folder.name)
    }
  },

  createComponent (mainFolder, subFolder) {
    console.info('Create component ' + mainFolder + ' / ' + this.getComponentName(subFolder))
    const file = File.resolve(this._toDir, mainFolder, this.getComponentName(subFolder) + '.html')
    const folder = File.resolve(this._fromDir, mainFolder, subFolder)
    const icons = this.getSvgIcons(folder)
    const component = this.buildComponent(icons)
    fs.writeFileSync(file, component)
  },

  getComponentName (name) {
    const value = this.sanitizeName(name)
    return (ExtendJS.isNumeric(value.substring(0, 1))) ? 'a' + value : value
  },

  getSvgIcons (folder) {
    const list = {}
    const folderVariants = this.getFolderVariants()
    const variants = this.getVariants()
    for (let i = 0; i < folderVariants.length; i++) {
      const file = File.resolve(folder, `materialicons${folderVariants[i]}/24px.svg`)
      if (fs.existsSync(file)) {
        list[variants[i]] = this.getSvgInner(file)
      }
    }
    return this.removeDuplicates(list)
  },

  getFolderVariants () {
    return ['', 'outlined', 'round', 'sharp', 'twotone']
  },

  getVariants () {
    return ['default', 'outlined', 'round', 'sharp', 'two-tone']
  },

  getSvgInner (file) {
    return File.readFile(file).replace(/<svg.*?>/g, '')
      .replace(/<\/svg>|<g>|<\/g>/g, '').trim()
  },

  removeDuplicates (list) {
    const variants = this.getVariants()
    for (let i = variants.length - 1; i >= 0; i--) {
      for (let j = 0; j < variants.length; j++) {
        if (i !== j && list[variants[i]] === list[variants[j]]) {
          delete list[variants[i]]
          variants.splice(i, 1)
          break
        }
      }
    }
    return list
  },

  buildComponent (icons) {
    let html = `<svg class="${this._ref}" viewBox="0 0 24 24" data-ss-component="_VARIANTS_">` +
      '_INNER_</svg>'
    html = this.setDefaultSvgInner(html, icons)
    html = this.setVariantsInJson(html, icons)
    return html
  },

  setDefaultSvgInner (html, icons) {
    const svg = Object.values(icons)[0]
    delete icons[Object.keys(icons)[0]]
    return html.replace('_INNER_', svg)
  },

  setVariantsInJson (html, icons) {
    const data = { variants: { type: {} } }
    for (const [variant, svg] of Object.entries(icons)) {
      data.variants.type[variant] = { [this._ref]: { inner: svg } }
    }
    const json = JSON.stringify(data).replaceAll('"', '&quot;')
    return html.replace('_VARIANTS_', json)
  },

  buildIconPreview () {
    const html = File.readFile('./lib/template/icons.html')
    const rows = this.getPreviewRows()
    File.writeToFile('./project/icons.html', html.replace('_BODY_', rows))
  },

  getPreviewRows () {
    let html = ''
    for (const folder of File.readFolder(this._toDir)) {
      html += `<section class="block e032ojhc">
        <h3 class="text e0kua9zr preview-icon-title">${folder.name}</h3>
        <div class="block e0ht91h5 preview-icon-cells">
          ${this.getPreviewCells(folder.children)}
        </div>
      </div>`
    }
    return html
  },

  getPreviewCells (files) {
    let html = ''
    for (const file of files) {
      const svg = File.readFile(file.path)
      html += `<div class="block e0yhav44 preview-icon-cell">
        ${svg.replace(/ data-ss-component=".*?"/g, '')}
        <p class="text e0xn6nay">${file.name.replace('.html', '')}</p>
      </div>`
    }
    return html
  }
}
