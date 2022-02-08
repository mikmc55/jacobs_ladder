const loadServer = require('./server')
const fs = require('fs')
const path = require('path')
const staticFolder = path.join(__dirname, 'static')
const rimraf = require('rimraf')

const needle = require('needle')

const addonUrl = 'http://127.0.0.1:3000/'

const streamLinks = []

function build() {
	fs.mkdirSync(path.join(staticFolder, 'stream'))
	fs.mkdirSync(path.join(staticFolder, 'stream', 'tv'))
	needle.get(addonUrl + 'manifest.json', { json: true }, (err, resp, manifest) => {
		fs.writeFileSync(path.join(staticFolder, 'manifest.json'), JSON.stringify(manifest))
		manifest.catalogs.forEach(el => {
			needle.get(addonUrl + 'catalog/' + el.type + '/' + el.id + '.json', { json: true }, (err, resp, cat) => {
				fs.writeFileSync(path.join(staticFolder, 'catalog', el.type, el.id + '.json'), JSON.stringify(cat))
				cat.metas.forEach(el => {
					needle.get(addonUrl + 'stream/' + 'tv' + '/' + el.id + '.json', { json: true }, (err, resp, meta) => {
						fs.writeFileSync(path.join(staticFolder, 'stream', 'tv', el.id + '.json'), JSON.stringify(meta))
						
					})
				})
			})
		})
	})
}


	build()

