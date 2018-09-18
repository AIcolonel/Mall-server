/*
options={
	page:,
	model:,
	query:,
	field:,
	sort:,
	populate:[]//定义一个数组，传入关联的条件和对象
}
*/

let paging=(options)=>{
	return new Promise((resolve,reject)=>{
		// 分页原理，利用传递page参数，用req.query拿到page，
		//设定每页显示的数据条数limit这样就可利用这两条数据进行分页
		let page =1;

		if(!isNaN(parseInt(options.page))){
			page=options.page;
		}

		if(page<=0){
			page = 1;
		}
		let limit=4;
		
		// 获取数据的总条数，进而计算出总页数
		options.model.countDocuments(options.query)
		.then((count)=>{
			let pages=Math.ceil(count/limit);
			if(page>pages){
				page=pages;
			}
			if(pages==0){
				page=1
			}

			// 由于html模板无法遍历循环，因此我们可以自己定义一个数组，将页码存进去，然后进行循环
			let list=[];
			for(let i=1;i<=pages;i++){
				list.push(i);
			}
			// 要显示下一页的数据，则需要将上一页的数据条数跳过
			let skip=(page - 1) * limit;
			
			// 获取用户信息
			// 首先找出关联数据
			let query=options.model.find(options.query,options.field);
			// 循环关联条件
			if(options.populate){
				for(let i=0;i<options.populate.length;i++){
					query=query.populate(options.populate[i])
				}
			}
			query
			.sort(options.sort)
			.skip(skip)
			.limit(limit)
			.then((docs)=>{
				resolve({
					current:page*1,
					list:docs,
					total:count,
					pageSize:limit
				});
			})
		})
	})
}

module.exports=paging;