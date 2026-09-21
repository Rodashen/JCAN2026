// Bootstrap handles the mobile menu; anchors use native scrolling.
document.querySelectorAll('.navbar-collapse a').forEach(link=>link.addEventListener('click',()=>{
 const menu=document.querySelector('.navbar-collapse');
 if(menu?.classList.contains('show'))bootstrap.Collapse.getOrCreateInstance(menu,{toggle:false}).hide();
}));
