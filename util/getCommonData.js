const Category = require('../models/category.js');
const Article = require('../models/article.js');
const fs=require('fs');
const path=require('path');
/*
获取前台共通数据 
*/ 
let getCommonData = ()=>{

	return new Promise((resolve,reject)=>{
		Category.find({},'_id name')
		.sort({order:1})
		.then(category=>{
			Article.find({},'_id click intro')
			.sort({click:-1})
			.limit(10)
			.then(clickList=>{

				let filePath = path.normalize(__dirname + '/../site-info.json');
				fs.readFile(filePath,(err,data)=>{
					let siteDate={};
					if(err){
						console.log(err)
					}else{
						let siteDate=JSON.parse(data);
						resolve({
							category:category,
							clickList:clickList,
							siteDate:siteDate
						})
					}
				})
			})
		})
	});
}

module.exports = getCommonData;