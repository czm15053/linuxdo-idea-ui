const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {test}=require('node:test');
const source=readFileSync(process.env.XHS_TEST_BUNDLE||resolve(__dirname,'../xhs-im.user.js'),'utf8');
function fn(name){
 const start=source.search(new RegExp(`^  (?:async )?function ${name}\\(`,'m'));
 if(start<0)return '';
 const end=source.indexOf('\n  }',start)+4;
 assert(end>start);return source.slice(start,end);
}
const row=(id,noteId)=>({id,noteId,name:id,text:id,avatar:'avatar'});
function context(extra={}){
 const c=vm.createContext({detailView:{classList:{contains:()=>true},querySelector:()=>null},detailRenderedHref:'/explore/A',
 document:{getElementById:()=>null},findVueRouter:()=>null,detailNavigation:null,lastThreadDetail:{id:'A',detail:{pin:{id:'A'},replies:[row('a','A')]}},commentPaging:false,
 renderDetailThread:()=>{},noteContainer:()=>null,unwrap:x=>x,toast:()=>{},...extra});
 for(const name of ['getNoteState','isCurrentThread','collectNoteComments','flattenRawComments','harvestCommentsFromState','applyCommentBatch','expandCommentSoft','pageMoreComments','expandDetailComments']){
  const code=fn(name);if(code)vm.runInContext(code,c);
 }
 Object.assign(c,extra);
 return c;
}
function activate(c,id,rows=[]){c.lastThreadDetail={id,detail:{pin:{id},replies:rows}};c.detailRenderedHref='/explore/'+id;}
for(const name of ['pageMoreComments','expandCommentSoft']){
 for(const target of ['B','A']){
  test(`${name}: old A result cannot overwrite ${target==='A'?'reopened A':'new B'}`,async()=>{
   let release;const pending=new Promise(r=>release=r);
   const c=context({loadMoreComments:()=>pending});
   const run=vm.runInContext(name+'()',c);
   activate(c,target,[row('new',target)]);const active=c.lastThreadDetail;
   release([row('old','A')]);await run;await Promise.resolve();
   assert.equal(c.lastThreadDetail,active);assert.equal(active.detail.replies[0].id,'new');
  });
 }
}
test('closed drawer ignores a delayed page result',async()=>{
 let release;const c=context({loadMoreComments:()=>new Promise(r=>release=r)});
 const run=vm.runInContext('pageMoreComments()',c);c.lastThreadDetail=null;c.detailView.classList.contains=()=>false;
 release([row('old','A')]);await run;assert.equal(c.lastThreadDetail,null);
});
test('old page completion does not release the new note paging state',async()=>{
 let release;const c=context({loadMoreComments:()=>new Promise(r=>release=r)});
 const run=vm.runInContext('pageMoreComments()',c);activate(c,'B');c.lastThreadDetail.detail.commentsPaging=true;
 release([row('old','A')]);await run;assert.equal(c.lastThreadDetail.detail.commentsPaging,true);
});
test('B cache does not merge comments from the old A DOM',()=>{
 const c=context({harvestCommentsFromState:()=>[row('b','B')],harvestNoteComments:()=>[row('a','A')]});
 assert.equal(vm.runInContext("collectNoteComments('B').map(c=>c.id).join(',')",c),'b');
});
test('unscoped global comments cannot stand in for the requested note',()=>{
 const c=context({getInitialState:()=>({note:{comments:[row('a','A')],noteDetailMap:{B:{comments:{list:[],firstRequestFinish:true}}}}}),commentFromRaw:x=>x});
 assert.equal(vm.runInContext("harvestCommentsFromState('B').length",c),0);
});
test('explicit foreign note IDs are rejected even inside a keyed cache',()=>{
 const c=context({getInitialState:()=>({note:{noteDetailMap:{B:{comments:{list:[row('a','A'),row('b','B')]}}}}}),commentFromRaw:x=>({...x})});
 assert.equal(vm.runInContext("harvestCommentsFromState('B').map(c=>c.id).join(',')",c),'b');
});
test('missing cache is unavailable, not an authoritative empty result',()=>{
 const c=context({getInitialState:()=>({note:{noteDetailMap:{}}})});
 assert.equal(vm.runInContext("harvestCommentsFromState('B')",c),null);
});
test('a smaller authoritative snapshot removes polluted comments',()=>{
 const c=context();activate(c,'B',[row('b','B'),row('a','A')]);c.incoming=[row('b','B')];
 vm.runInContext("applyCommentBatch('B',incoming)",c);assert.equal(c.lastThreadDetail.detail.replies.length,1);
});
test('an authoritative empty note clears the previous snapshot',()=>{
 const c=context();activate(c,'B',[row('a','A')]);
 vm.runInContext("applyCommentBatch('B',[])",c);assert.equal(c.lastThreadDetail.detail.replies.length,0);
});
test('an unavailable snapshot leaves the current note intact',()=>{
 const c=context();activate(c,'B',[row('b','B')]);
 vm.runInContext("applyCommentBatch('B',null)",c);assert.equal(c.lastThreadDetail.detail.replies.length,1);
});

test('expand-all completion is discarded after switching notes',async()=>{
 let release;let calls=0;const btn={disabled:false,title:'展开全部评论'};
 const c=context({expandAllComments:()=>new Promise(r=>release=r),collectNoteComments:()=>{calls++;return [row('old','A')]}});
 assert(fn('expandDetailComments'),'expand handler must be independently callable');
 c.event={currentTarget:btn,stopPropagation(){}};
 const run=vm.runInContext('expandDetailComments(event)',c);activate(c,'B',[row('new','B')]);
 release(1);await run;assert.equal(calls,0);assert.equal(c.lastThreadDetail.detail.replies[0].id,'new');
});
for(const name of ['loadMoreComments','expandAllComments']){
 test(`${name} stops native actions after cancellation at its await`,async()=>{
  let release;let active=true;let rounds=0;
  const c=context({setTimeout:r=>{release=r},expandCommentRound:()=>{rounds++;return 1},collectNoteComments:()=>[row('a','A')],active:()=>active});
  vm.runInContext(fn(name),c);const run=vm.runInContext(`${name}('A',active)`,c);
  assert.equal(rounds,1);active=false;release();await run;assert.equal(rounds,1);
 });
}
test('native actions for A do not scroll or expand the currently open B',()=>{
 let clicks=0;const c=context({getInitialState:()=>({note:{currentNoteId:'B'}}),kickCommentScroller:()=>clicks++,commentMoreButtons:()=>[{click:()=>clicks++}]});
 vm.runInContext(fn('expandCommentRound'),c);vm.runInContext("expandCommentRound('A')",c);assert.equal(clicks,0);
});
// Exercise the real open/close flow, rather than only changing a note-id string.
for(const outcome of ['success','failure']){
 for(const reopenSame of [false,true]){
  test(`initial ${outcome} from an older open cannot replace ${reopenSame?'reopened A':'B'}`,async()=>{
   const A='aaaaaaaaaaaaaaaaaaaaaaaa',B=reopenSame?A:'bbbbbbbbbbbbbbbbbbbbbbbb';
   const pending=[];const renders=[];
   const body={dataset:{},innerHTML:'',querySelector:()=>null};
   const view={classList:{contains:()=>true},querySelector:s=>s==='.im-detail-body'?body:null};
   const c=context({detailView:view,document:{querySelector:()=>({})},ensureDetailView:()=>view,
    findTweetArticle:()=>null,getCachedNoteFromState:id=>({id}),pinFromNoteObject:(_n,id)=>({id,text:id}),
    setDetailOpen:()=>{},detailPrevUrl:'',location:{pathname:'/explore',search:''},console:{info(){},warn(){},error(){}},
    threadPinHtml:pin=>pin.id,fetchTweetDetail:()=>new Promise((resolve,reject)=>pending.push({resolve,reject})),
    renderDetailThread:d=>{renders.push(d.pin.id);body.innerHTML=d.pin.id},fillCommentsLater:()=>{}});
   vm.runInContext(fn('openTweetDetail'),c);vm.runInContext(fn('closeDetailDrawer'),c);
   vm.runInContext(`openTweetDetail('/explore/${A}')`,c);await Promise.resolve();
   vm.runInContext('closeDetailDrawer()',c);
   assert.equal(c.lastThreadDetail,null);
   vm.runInContext(`openTweetDetail('/explore/${B}')`,c);await Promise.resolve();const active=c.lastThreadDetail;
   pending[1].resolve({pin:{id:B},replies:[row('new',B)]});await Promise.resolve();await Promise.resolve();await Promise.resolve();await Promise.resolve();
   if(outcome==='success')pending[0].resolve({pin:{id:A},replies:[row('old',A)]});else pending[0].reject(new Error('old failure'));
   await Promise.resolve();await Promise.resolve();await Promise.resolve();await Promise.resolve();
   assert.equal(c.lastThreadDetail,active);assert.equal(c.lastThreadDetail.detail.replies[0].id,'new');
   assert.equal(body.innerHTML,B);assert.equal(renders.length,1);
  });
 }
}
test('a canceled detail fetch stops polling and returns no result',async()=>{
 let release;let active=true;let kicks=0;
 const c=context({getCachedNoteFromState:id=>({id}),pinFromNoteObject:(_n,id)=>({id,text:'title'}),
  clickNativeNoteCard:()=>{},collectNoteComments:()=>[],sleep$1:()=>new Promise(r=>release=r),
  kickCommentScroller:()=>kicks++,active:()=>active});
 vm.runInContext(fn('fetchTweetDetail'),c);
 const run=vm.runInContext("fetchTweetDetail('A',active)",c);active=false;release();assert.equal(await run,null);assert.equal(kicks,0);
});
test('a delayed history-back cannot undo the next opened note',()=>{
 let path='/explore/aaaaaaaaaaaaaaaaaaaaaaaa';let pop;
 const c=context({location:{get pathname(){return path}},detailPrevUrl:'/explore',closeDetailDrawer:()=>{},
  history:{length:3,replaceState:(_s,_t,url)=>{path=url},back:()=>{pop=()=>{path='/explore'}}},
  navigateX:url=>{path=url}});
 vm.runInContext(fn('closeDetailTo'),c);vm.runInContext('closeDetailTo()',c);
 path='/explore/bbbbbbbbbbbbbbbbbbbbbbbb';if(pop)pop();
 assert.equal(path,'/explore/bbbbbbbbbbbbbbbbbbbbbbbb');
});
test('comments use the live note store when the initial snapshot only contains the first note',()=>{
 const live={noteDetailMap:{B:{comments:{list:[row('b','B')],firstRequestFinish:true}}}};
 const c=context({getInitialState:()=>({note:{noteDetailMap:{A:{comments:{list:[row('a','A')]}}}}}),commentFromRaw:x=>x,
 document:{getElementById:()=>({__vue_app__:{config:{globalProperties:{$pinia:{state:{value:{note:live}}}}}}})}});
 const helper=fn('getNoteState');if(helper)vm.runInContext(helper,c);
 assert.equal(vm.runInContext("harvestCommentsFromState('B')?.[0]?.id",c),'b');
});
test('detail pin uses the live note store after switching away from the initial note',()=>{
 const live={noteDetailMap:{B:{note:{id:'B',title:'new note'}}}};
 const c=context({getInitialState:()=>({note:{noteDetailMap:{A:{note:{id:'A'}}}}}),
 document:{getElementById:()=>({__vue_app__:{config:{globalProperties:{$pinia:{state:{value:{note:live}}}}}}})}});
 const helper=fn('getNoteState');if(helper)vm.runInContext(helper,c);
 vm.runInContext(fn('getCachedNoteFromState'),c);
 assert.equal(vm.runInContext("getCachedNoteFromState('B')?.title",c),'new note');
});
test('opening a note waits for the pending return navigation before fetching',async()=>{
 let release;let fetches=0;const nav=new Promise(r=>release=r);
 const body={dataset:{},innerHTML:'',querySelector:()=>null};
 const view={classList:{contains:()=>true},querySelector:s=>s==='.im-detail-body'?body:null};
 const c=context({detailNavigation:nav,detailView:view,document:{querySelector:()=>({})},ensureDetailView:()=>view,
  findTweetArticle:()=>null,getCachedNoteFromState:id=>({id}),pinFromNoteObject:(_n,id)=>({id,text:id}),
  setDetailOpen:()=>{},detailPrevUrl:'/explore',location:{pathname:'/explore/aaaaaaaaaaaaaaaaaaaaaaaa',search:''},
  console:{info(){},warn(){},error(){}},threadPinHtml:pin=>pin.id,
  fetchTweetDetail:()=>{fetches++;return Promise.resolve({pin:{id:'aaaaaaaaaaaaaaaaaaaaaaaa'},replies:[row('new','A')]})}});
 vm.runInContext(fn('openTweetDetail'),c);vm.runInContext("openTweetDetail('/explore/aaaaaaaaaaaaaaaaaaaaaaaa')",c);
 assert.equal(fetches,0);release();await Promise.resolve();await Promise.resolve();await Promise.resolve();await Promise.resolve();assert.equal(fetches,1);
});
