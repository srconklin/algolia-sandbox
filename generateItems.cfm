<cfsetting showDebugOutput = "no" enablecfoutputonly="true" >
<cfset items = [] /> 
<cfset cacheMenu = {} /> 

<cffunction name="getMenus">
	<cfargument name="classTID" required="true" type="numeric" />
	<cfargument name="MenuID" required="false"  default="" type="string" />
	<cfargument name="lvlThreshold" required="false" default="4" type="numeric" />
	<cfargument name="delimeter" required="false" default=">" type="string" />
	<cfquery name="qry" datasource="dp_cat" >

		WITH cte_bredcrumb 
		AS 
		(
			-- Anchor member
			SElECT oh.TID, oh.lnm, oh.MenuID, oh.ParentMenuID, oh.lvl, left(oh.MenuID, 3) as base
			FROM [dp_cat].[dbo].[OpsHierarchy2] oh
			WHERE  oh.vtid = 63160  
			and oh.tid = #arguments.classTID#
			<cfif len(arguments.MenuID)>
				and ParentMenuID = '#arguments.MenuID#'
			</cfif>
			and lvl < #arguments.lvlThreshold#
			
			UNION ALL
			-- Recursive member that references expression_name.
			SELECT o.TID,o.lnm, o.MenuID, o.ParentMenuID, o.lvl, cte.base 
			FROM [dp_cat].[dbo].[OpsHierarchy2] o
			INNER JOIN cte_bredcrumb cte on cte.ParentMenuID =  o.MenuID
			WHERE  o.vtid = 63160  and o.lvl > 0 
		)

		SELECT MenuID, lnm, base, lvl
		FROM cte_bredcrumb 
		order by base, lvl

		-- select base,
		-- STRING_AGG(lnm,' #arguments.delimeter# ') WITHIN GROUP ( ORDER BY lvl asc)
		-- AS breadcrumb
		-- from cte_bredcrumb 
		-- group by base

	</cfquery>

	<cfreturn qry />
</cffunction>


<cfquery name="getItems" datasource="dp_cat">
	select top 250
	C.LNm,C.Par1LNm, C.Syn,C.ParentMenuID,
	I.Cotid, I.IVTID,
	I.ItemNo, I.dataTID, I.isFeatured,	I.isNew, I.isReduced, I.isSpecial, I.Headline, I.Descr, I.adddt
	I.Price,
	-- I.Prifmt,
	-- I.CurrSymbolScaled,
	I.Qty,
	--I.UnitsDisplay,
	I.makeTxt,
	I.Model,
	I.imgServNameMn,
	I.DescrSfx,
	geo.citySnm, geo.stSnm, geo.CySnm
	FROM Items I WITH (NOLOCK)
	INNER JOIN OpsClasses C on C.VTID=63160 AND C.classTID=I.dataTID AND C.vizPagetop <= 0
	INNER JOIN CoVenues VP ON VP.VTID=I.VTID
	OUTER APPLY dbo.getGeoData(I.LLocGID,I.LStPGID,I.LCyGID) as geo
	WHERE I.ArchDt IS NULL
	AND I.IVTID=108 AND (I.vizPub>=9 OR (I.PNo=0 AND 9 <= VP.viz))  AND (I.Qty>0 OR I.inAuction=1 OR 0 >= 3)  AND (I.Qty>0 OR I.OfferBid=1 OR I.inAuction>0 ) AND I.OfferBid=0
	ORDER BY I.DataTID
		-- AND ( I.Headline +ISNULL(I.Descr,'')+ ' ' +ISNULL(I.maketxt,'')+ ' ' +ISNULL(I.model,'')+ ' '  + ISNULL(I.DescrSfx,'')+ ' ' + ISNULL(I.CoItemID,'')  LIKE '%a%')
		--ORDER BY sort_col,mfr,model,vPri ASC
  </cfquery>
	

<cfoutput query="getItems">
	<!--- myStruct=createObject("java", "java.util.LinkedHashMap").init(); --->
	<cfset item = StructNew("Ordered") />  

	<cfset item['itemno'] =  "#getItems.Itemno#" />   
	<cfset item['headline'] = "#trim(REReplaceNoCase(getItems.headline,"<[^>]*>", " ","All"))#" />   
	<cfset item['description'] = "#trim(REReplaceNoCase(getItems.descr,"<[^>]*>", " ","All"))#"  />   
	<cfset item['mfr'] =  "#getItems.maketxt#" />
	<cfset item['model'] =  "#getItems.model#" />
	<cfset item['price'] =  len(getItems.price) ? "#dollarFormat(getItems.price)#" : "unstated" />
	<cfset item['qty'] =  "#getItems.qty#" />
	<cfset item['location'] =  "#getItems.citySnm#, #getItems.stSnm# #getItems.CySnm#"/>
	<cfset item['category'] =  "#getItems.LNm#" />
	<cfset item['keywords'] =  "#trim(replace(getItems.syn, ',',' ','all'))#" />
	<cfset item['adddate'] =  "#getItems.adddt#" />  
	<cfset qryMenus = getMenus(getItems.dataTID, getItems.ParentMenuID) />
	
	<cfset breadcrumb = "" />
	<cfloop query="qryMenus">
		<cfset breadcrumb = listAppend(breadcrumb, qryMenus.lnm, '>') />
		<cfset breadcrumb = replace(breadcrumb,">", ' > ', 'all') />
		<cfset item['categories.lvl#qryMenus.currentrow-1#'] = "#breadcrumb#" />
	</cfloop>	

	<!--- add images if any --->
	<cfif len(getItems.imgServNameMn)>
		<cfset item['image'] = "https://www.capovani.com/clientresources/#Trim(getItems.CoTID)#/#getItems.IVTID#/#Trim(Right(getItems.DataTID,2))#/#getItems.DataTID#/#getItems.imgServNameMn#"/>
	<cfelse>
		<cfset item['image'] = "https://www.capovani.com/dpimages/noImage.png"/> 
	</cfif>

	<cfset arrayAppend(items, item) />

</cfoutput>

<cfcontent reset="true"> 
<cfheader name="Content-Type" value="application/json"> 

 <cfoutput>
  #trim(serializeJSON(items))#
 </cfoutput>


