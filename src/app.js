/* global algoliasearch instantsearch */


// import algoliasearch from 'algoliasearch/lite';
// import instantsearch from 'instantsearch.js';
 import searchRouting from './search-routing';

// import {
//   searchBox,
//   hits,
//   clearRefinements,
//   hierarchicalMenu,
//   sortBy,
//   refinementList,
//   pagination,
//   configure,
//   stats,
//   breadcrumb,
//   panel
// } from 'instantsearch.js/es/widgets';


const searchClient = algoliasearch(
  'S16PTK744D',
  'de0e3624732a96eacb0ed095dd52339c'
);

const search = instantsearch({
  indexName: 'cbi',
  searchClient,
  routing: searchRouting
  //  routing: {
  //         router: historyRouter(), //router option
  //  //     stateMapping : {} stateMapping options to map uiState to routeState, and vice versa.
  
  //  }

});


const refinementListWithPanel =  instantsearch.widgets.panel({
  templates: {
    header: 'Manufacturer',
  },
})(instantsearch.widgets.refinementList);

const HMWithPanel =  instantsearch.widgets.panel({
  templates: {
    header: 'Categories',
  },
})(instantsearch.widgets.hierarchicalMenu);

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),

  // breadcrumb({
  //   container: '#breadcrumb',
  //   attributes: [
  //     'hierarchicalCategories.lvl0',
  //     'hierarchicalCategories.lvl1',
  //     'hierarchicalCategories.lvl2',
  //   ],
  // })

  // clearRefinements({
  //   container: '#clear-refinements',
  // }),


  // sortBy({
  //   container: '#sort-by',
  //   items: [
  //     { label: 'Price (asc)', value: 'products_price_asc' },
  //     { label: 'Price (desc)', value: 'products_price_desc' },
  //   ],
  // }),


  // currentRefinements({
  //   container: '#current-refinements',
  // }),


  // refinementList({
  //   container: '#categories',
  //   attribute: 'categories',
  //   showMore: true,
  //   showMoreLimit: 20,
  //   searchable: true,
  //   searchablePlaceholder: 'search a category',
  //   sortBy: ['name:asc']

  // }),

  HMWithPanel({
    container: '#categories',
    attributes: [
      'categories.lvl0',
      'categories.lvl1',
      'categories.lvl2'
    ]
  }),

  refinementListWithPanel({
    container: '#mfr',
    attribute: 'mfr',
    showMore: true,
    showMoreLimit: 20,
    searchable: true,
    searchablePlaceholder: 'search a mfr...',
    sortBy: ['name:asc'],

  }),

  instantsearch.widgets.stats({
    container: '#stats',
    templates: {
      text: `
        {{#hasNoResults}}No results{{/hasNoResults}}
        {{#hasOneResult}}1 result{{/hasOneResult}}
        {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results{{/hasManyResults}}
      `
    }
  }),

  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: `
        <article class="hit" itemscope itemtype="http://schema.org/Product">
          <header>
            <div class="hit-image">
              <img itemprop="image"src="{{image}}" alt="{{headline}}" />
            </div>
            <link itemprop="url" href="{{image}}" />
          </header>

          <main>
            <div class="hit-detail">
              <p itemprop="category" class="category">{{#helpers.highlight}}{ "attribute": "category" }{{/helpers.highlight}}</p> 
              <h1 itemprop="name">{{#helpers.highlight}}{ "attribute": "headline" }{{/helpers.highlight}}</h1> 
              <p itemprop="description" class="description">{{#helpers.highlight}}{ "attribute": "description" }{{/helpers.highlight}}</p> 
            </div>
          </main>
        
          <footer>
            <p itemprop="manufacturer" class="hit-mfr">Mfr: <span>{{#helpers.highlight}}{ "attribute": "mfr" }{{/helpers.highlight}}</span></p>
            <p itemprop="model" class="hit-model">Model: <span>{{#helpers.highlight}}{ "attribute": "model" }{{/helpers.highlight}}</span></p>
            <p itemprop="offers" itemscope itemtype="http://schema.org/Offer">
              <span class="hit-qty">{{qty}} unit @</span> <span itemprop="price" content="{{price}}" class="hit-price">{{price}}</span>
            </p>
            <div class="hit-footer">
              <p>
              <span  class="location">{{location}}</span>
              </p>
              <p>Item &bull; <span itemprop="productID" class="itemno">{{itemno}}</span></p>
          </div>
          </footer>
      `
    },
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),


  instantsearch.widgets.configure({
    hitsPerPage: 16
  })

]);

search.start();
