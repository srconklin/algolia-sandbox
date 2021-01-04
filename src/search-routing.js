/* global instantsearch */
import instantsearch from 'instantsearch.js';

import {
	history as historyRouter
  } from 'instantsearch.js/es/lib/routers';
 
 // import { simple as simpleMapping } from 'instantsearch.js/es/lib/stateMappings';

const encodedCategories = {
	Cameras: 'Cameras & Camcorders',
	Cars: 'Car Electronics & GPS',
	Phones: 'Cell Phones',
	TV: 'TV & Home Theater',
  };
  
  const decodedCategories = Object.keys(encodedCategories).reduce((acc, key) => {
	const newKey = encodedCategories[key];
	const newValue = key;
  
	return {
	  ...acc,
	  [newKey]: newValue,
	};
  }, {});
  
  // Returns a slug from the category name.
  // Spaces are replaced by "+" to make
  // the URL easier to read and other
  // characters are encoded.
  function getCategorySlug(name) {
	const encodedName = decodedCategories[name] || name;
  
	return encodedName
	  .split(' ')
	  .map(encodeURIComponent)
	  .join('+');
  }
  
  // Returns a name from the category slug.
  // The "+" are replaced by spaces and other
  // characters are decoded.
  function getCategoryName(slug) {
	const decodedSlug = encodedCategories[slug] || slug;
  
	return decodedSlug
	  .split('+')
	  .map(decodeURIComponent)
	  .join(' ');
  }
  
  const router = historyRouter({
	windowTitle(routeState) {

	  const { category, query } = routeState;

	  console.log(routeState);

	  const queryTitle = query ? `CBI Results for "${query}"` : 'CBI Search';
  
	  if (category) {
		return `${category} – ${queryTitle}`;
	  }
  
	  return queryTitle;
	},
  
	createURL({ qsModule, routeState, location }) {
	  const urlParts = location.href.match(/^(.*?)\/search/);
	  const baseUrl = `${urlParts ? urlParts[1] : ''}/`;
  
	  const categoryPath = routeState.category
		? `${getCategorySlug(routeState.category)}/`
		: '';
	  const queryParameters = {};
  
	  if (routeState.query) {
		queryParameters.query = encodeURIComponent(routeState.query);
	  }
	  if (routeState.page !== 1) {
		queryParameters.page = routeState.page;
	  }
	  if (routeState.mfrs) {
		queryParameters.mfrs = routeState.mfrs.map(encodeURIComponent);
	  }
  
	  const queryString = qsModule.stringify(queryParameters, {
		addQueryPrefix: true,
		arrayFormat: 'repeat',
	  });
  
	  return `${baseUrl}search/${categoryPath}${queryString}`;
	},
  
	parseURL({ qsModule, location }) {
	  const pathnameMatches = location.pathname.match(/search\/(.*?)\/?$/);
	  const category = getCategoryName(
		(pathnameMatches && pathnameMatches[1]) || ''
	  );
	  const { query = '', page, mfrs = [] } = qsModule.parse(
		location.search.slice(1)
	  );
	  // `qs` does not return an array when there's a single value.
	  const allmfrs = Array.isArray(mfrs) ? mfrs : [mfrs].filter(Boolean);
  
	  return {
		query: decodeURIComponent(query),
		page,
		mfrs: allmfrs.map(decodeURIComponent),
		category
	  };
	},
  });
  
  
  const stateMapping = {
	stateToRoute(uiState) {
		const indexUiState = uiState['cbi'] || {};
		//console.log(indexUiState.hierarchicalMenu.categories);
	  // refer to uiState docs for details: https://www.algolia.com/doc/api-reference/widgets/ui-state/js/
	  return {
		query: indexUiState.query,
		page: indexUiState.page,
		mfrs: indexUiState.refinementList && indexUiState.refinementList.mfr,
		// category: indexUiState.hierarchicalMenu && indexUiState.hierarchicalMenu.categories
		category: indexUiState.hierarchicalMenu && indexUiState.hierarchicalMenu['categories.lvl0'].join('_'),
	  };
	},
  
	routeToState(routeState) {
	  // refer to uiState docs for details: https://www.algolia.com/doc/api-reference/widgets/ui-state/js/
	  return {
		// eslint-disable-next-line camelcase
		cbi: {
		  query: routeState.query,
		  page: routeState.page,
		  hierarchicalMenu: {
			'categories.lvl0': routeState.category && routeState.category.split('_')
		  },
		  refinementList: {
			mfr: routeState.mfrs,
		  },
		}
	  };
	},
  };
  
  const searchRouting = {
	router,
	stateMapping
  };
  
  export default searchRouting;
  