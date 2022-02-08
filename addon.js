const { addonBuilder } = require("stremio-addon-sdk");
const parser = require ('./iptv-playlist-parser.js')
const fs = require('fs')
const playlist = fs.readFileSync('./new.m3u', 'utf8');
const defaults = require('./config.js')
const list = parser.parse(playlist)
const convertArrayToObject = (array, key) => {
  const initialValue = {};
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: item,
    };
  }, initialValue);
};
const dataset = 
convertArrayToObject(
    list.items,
    'id',
  ) 

const grouping = list.items
let group = grouping.map(({ group }) => group)
  .filter(function(item, index, group) {
    return group.indexOf(item, index + 1) === -1;
  })


const catalogs = []
for (let key in group) {
		catalogs.push({
		id: group[key],
		name: group[key],
		type: "tv",
	})
	}
const metakey = []
for (let key in dataset) {
		metakey.push({
		id: dataset[key].id,
		name: dataset[key].name,
		type: "tv",
        background: dataset[key].logo,
        logo: dataset[key].logo,
        poster: dataset[key].logo,
        posterShape: 'landscape',
        description: 'IPTV addon from Help Yourself!'
	})
	}
const meta = 
convertArrayToObject(
    metakey,
    'id',
  ) 
const streamkey = []
for (let key in dataset) {
		streamkey.push({
		id: dataset[key].id,
		name: dataset[key].name,
		url: dataset[key].url
	})
	}

const stream = 
convertArrayToObject(
    streamkey,
    'id',
  ) 

const manifest = { 
    "id": defaults.name,
    "version": "1.0.0",
    "name": defaults.name,
    "icon": defaults.icon,
    "description": defaults.description,
    "resources": ["catalog","stream","meta"],
    "types": ["tv"], 
    catalogs

 };

const builder = new addonBuilder(manifest);

const generateMetaPreview = function(value, key) {
    const iptvId = key.split(":")[0]
    return {
        id: iptvId,
        type: 'tv',
        name: value.name,
        categorie: value.group,
        background: value.logo,
        logo: value.logo,
        poster: value.logo,
        posterShape: 'landscape'
        
        }
}

builder.defineCatalogHandler(function(args)  {
     const metas = Object.entries(dataset)
    .filter(([_, value]) => value.group === args.id)
	.map(([key, value]) => generateMetaPreview(value, key))

    return Promise.resolve({ metas: metas })


})

builder.defineMetaHandler(function(args) {
    if (dataset[args.id]) {
        return Promise.resolve({ meta: meta[args.id] });
    } else {
        return Promise.resolve({ meta: [] });
    }
})

builder.defineStreamHandler(function(args) {
    if (dataset[args.id]) {
        return Promise.resolve({ streams: [stream[args.id]] });
    } else {
        return Promise.resolve({ streams: [] });
    }
})


module.exports = builder.getInterface()
