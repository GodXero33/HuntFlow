async function loadMap (mapIndex) {
	return new Promise((resolve, reject) => {
		fetch(`maps/${mapIndex.toString().padStart(5, '0')}.json`).then(response => {
			if (!response) throw new Error('Failed to fetch map data');

			return response.json();
		}).then(mapData => resolve(mapData)).catch(error => reject(error));
	});
}

function loadMapResources (map) {
	return new Promise((resolve, reject) => {
		resolve(map);
	});
}

export {
	loadMap,
	loadMapResources
};
