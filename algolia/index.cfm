<cfscript>
	algoliaClient = new modules.algoliacfc.algolia( applicationId = 'S16PTK744D', apiKey = '0bc8ea1d8e8429fc08176aa64cc3121e' );
	index = algoliaClient.initIndex( 'cbi' );
	index.clearIndex();
	index.deleteIndex();
	index = algoliaClient.initIndex( 'cbi' );
	
	items = deserializeJSON( fileRead( expandPath( 'items.json' ) ) );

	index.addObjects( items );

    index.setSettings(settings={ 
		    'searchableAttributes' : ['headline', 'description', 'category', 'mfr', 'model', 'price', 'keywords'],
			'customRanking': ['desc(addate)'],
			'attributesForFaceting' : ['searchable(categories.lvl0)', 'searchable(categories.lvl1)',  'searchable(categories.lvl2)', 'searchable(mfr)']
		});

</cfscript>

done! 