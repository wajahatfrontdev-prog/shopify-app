import{w as m,r as l,e as g,c as h,j as e}from"./chunk-LFPYN7LY-yn807eHW.js";import{u as f}from"./useAppBridge-Bj34gXAL.js";const v=m(function(){const[n,x]=l.useState([]),[a,i]=l.useState({name:"",email:"",phone:"",address:"",city:"",zip:""}),r=g(),d=h(),o=f();l.useEffect(()=>{const t=JSON.parse(localStorage.getItem("cart")||"[]");x(t)},[]),l.useEffect(()=>{var t;(t=r.data)!=null&&t.success&&(o.toast.show(r.data.message),localStorage.removeItem("cart"),setTimeout(()=>d("/app/home"),2e3))},[r.data,d,o]);const c=n.reduce((t,s)=>t+parseFloat(s.price)*(s.quantity||1),0),u=t=>{t.preventDefault();const s=new FormData;Object.keys(a).forEach(p=>s.append(p,a[p])),s.append("cart",JSON.stringify(n)),r.submit(s,{method:"POST"})};return e.jsxs("s-page",{heading:"Checkout",children:[e.jsx("style",{children:`
        .checkout-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 40px;
        }
        .city-zip-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
        }
        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid #e1e3e5;
        }
        .order-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
        }
        .final-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 2px solid #e1e3e5;
        }
        @media (max-width: 768px) {
          .checkout-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .city-zip-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .order-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
        @media (max-width: 480px) {
          .checkout-container {
            gap: 16px;
          }
        }
      `}),e.jsxs("div",{className:"checkout-container",children:[e.jsx("s-section",{heading:"Shipping Information",children:e.jsxs("s-stack",{direction:"block",gap:"base",children:[e.jsx("s-text-field",{label:"Full Name",value:a.name,onChange:t=>i({...a,name:t.target.value}),required:!0}),e.jsx("s-text-field",{label:"Email",type:"email",value:a.email,onChange:t=>i({...a,email:t.target.value}),required:!0}),e.jsx("s-text-field",{label:"Phone",type:"tel",value:a.phone,onChange:t=>i({...a,phone:t.target.value}),required:!0}),e.jsx("s-text-field",{label:"Address",value:a.address,onChange:t=>i({...a,address:t.target.value}),required:!0}),e.jsxs("div",{className:"city-zip-grid",children:[e.jsx("s-text-field",{label:"City",value:a.city,onChange:t=>i({...a,city:t.target.value}),required:!0}),e.jsx("s-text-field",{label:"ZIP Code",value:a.zip,onChange:t=>i({...a,zip:t.target.value}),required:!0})]})]})}),e.jsxs("div",{children:[e.jsx("s-section",{heading:"Order Summary",children:e.jsx("s-card",{children:e.jsxs("s-stack",{direction:"block",gap:"base",style:{padding:"16px"},children:[n.map((t,s)=>e.jsxs("div",{className:"order-item",children:[e.jsx("s-text",{children:t.title}),e.jsxs("s-text",{children:["$",t.price]})]},s)),e.jsxs("div",{className:"order-total",children:[e.jsx("s-text",{children:"Subtotal"}),e.jsxs("s-text",{children:["$",c.toFixed(2)]})]}),e.jsxs("div",{className:"order-total",children:[e.jsx("s-text",{children:"Shipping"}),e.jsx("s-text",{children:"$10.00"})]}),e.jsxs("div",{className:"final-total",children:[e.jsx("s-text",{weight:"bold",size:"large",children:"Total"}),e.jsxs("s-text",{weight:"bold",size:"large",style:{color:"#2c6ecb"},children:["$",(c+10).toFixed(2)]})]})]})})}),e.jsx("s-button",{variant:"primary",size:"large",onClick:u,...r.state==="submitting"?{loading:!0}:{},style:{width:"100%",marginTop:"20px"},children:"Place Order"})]})]})]})});export{v as default};
