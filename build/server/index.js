var _a;
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter, UNSAFE_withComponentProps, Meta, Links, Outlet, ScrollRestoration, Scripts, useLoaderData, useActionData, Form, redirect, UNSAFE_withErrorBoundaryProps, useRouteError, useNavigate, Link, useFetcher } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import "@shopify/shopify-app-react-router/adapters/node";
import { shopifyApp, AppDistribution, ApiVersion, LoginErrorType, boundary } from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { useState, useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}
const prisma = global.prismaGlobal ?? new PrismaClient();
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: (_a = process.env.SCOPES) == null ? void 0 : _a.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {},
  ...process.env.SHOP_CUSTOM_DOMAIN ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] } : {}
});
ApiVersion.October25;
const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
const authenticate = shopify.authenticate;
shopify.unauthenticated;
const login = shopify.login;
shopify.registerWebhooks;
shopify.sessionStorage;
const streamTimeout = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, reactRouterContext) {
  addDocumentResponseHeaders(request, responseHeaders);
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: reactRouterContext, url: request.url }),
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width,initial-scale=1"
      }), /* @__PURE__ */ jsx("link", {
        rel: "preconnect",
        href: "https://cdn.shopify.com/"
      }), /* @__PURE__ */ jsx("link", {
        rel: "stylesheet",
        href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [/* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
const action$4 = async ({
  request
}) => {
  const {
    payload,
    session,
    topic,
    shop
  } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  const current = payload.current;
  if (session) {
    await prisma.session.update({
      where: {
        id: session.id
      },
      data: {
        scope: current.toString()
      }
    });
  }
  return new Response();
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4
}, Symbol.toStringTag, { value: "Module" }));
const action$3 = async ({
  request
}) => {
  const {
    shop,
    session,
    topic
  } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  if (session) {
    await prisma.session.deleteMany({
      where: {
        shop
      }
    });
  }
  return new Response();
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3
}, Symbol.toStringTag, { value: "Module" }));
function loginErrorMessage(loginErrors) {
  if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.MissingShop) {
    return { shop: "Please enter your shop domain to log in" };
  } else if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.InvalidShop) {
    return { shop: "Please enter a valid shop domain to log in" };
  }
  return {};
}
const loader$b = async ({
  request
}) => {
  const errors = loginErrorMessage(await login(request));
  return {
    errors
  };
};
const action$2 = async ({
  request
}) => {
  const errors = loginErrorMessage(await login(request));
  return {
    errors
  };
};
const route$1 = UNSAFE_withComponentProps(function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const {
    errors
  } = actionData || loaderData;
  return /* @__PURE__ */ jsx(AppProvider, {
    embedded: false,
    children: /* @__PURE__ */ jsx("s-page", {
      children: /* @__PURE__ */ jsx(Form, {
        method: "post",
        children: /* @__PURE__ */ jsxs("s-section", {
          heading: "Log in",
          children: [/* @__PURE__ */ jsx("s-text-field", {
            name: "shop",
            label: "Shop domain",
            details: "example.myshopify.com",
            value: shop,
            onChange: (e) => setShop(e.currentTarget.value),
            autocomplete: "on",
            error: errors.shop
          }), /* @__PURE__ */ jsx("s-button", {
            type: "submit",
            children: "Log in"
          })]
        })
      })
    })
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: route$1,
  loader: loader$b
}, Symbol.toStringTag, { value: "Module" }));
const loader$a = async ({
  request
}) => {
  await authenticate.admin(request);
  return null;
};
const headers$2 = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  headers: headers$2,
  loader: loader$a
}, Symbol.toStringTag, { value: "Module" }));
const index = "_index_1hqgz_1";
const heading = "_heading_1hqgz_21";
const text = "_text_1hqgz_23";
const content = "_content_1hqgz_43";
const form = "_form_1hqgz_53";
const label = "_label_1hqgz_69";
const input = "_input_1hqgz_85";
const button = "_button_1hqgz_93";
const list = "_list_1hqgz_101";
const styles = {
  index,
  heading,
  text,
  content,
  form,
  label,
  input,
  button,
  list
};
const loader$9 = async ({
  request
}) => {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return {
    showForm: Boolean(login)
  };
};
const route = UNSAFE_withComponentProps(function App2() {
  const {
    showForm
  } = useLoaderData();
  return /* @__PURE__ */ jsx("div", {
    className: styles.index,
    children: /* @__PURE__ */ jsxs("div", {
      className: styles.content,
      children: [/* @__PURE__ */ jsx("h1", {
        className: styles.heading,
        children: "A short heading about [your app]"
      }), /* @__PURE__ */ jsx("p", {
        className: styles.text,
        children: "A tagline about [your app] that describes your value proposition."
      }), showForm && /* @__PURE__ */ jsxs(Form, {
        className: styles.form,
        method: "post",
        action: "/auth/login",
        children: [/* @__PURE__ */ jsxs("label", {
          className: styles.label,
          children: [/* @__PURE__ */ jsx("span", {
            children: "Shop domain"
          }), /* @__PURE__ */ jsx("input", {
            className: styles.input,
            type: "text",
            name: "shop"
          }), /* @__PURE__ */ jsx("span", {
            children: "e.g: my-shop-domain.myshopify.com"
          })]
        }), /* @__PURE__ */ jsx("button", {
          className: styles.button,
          type: "submit",
          children: "Log in"
        })]
      }), /* @__PURE__ */ jsxs("ul", {
        className: styles.list,
        children: [/* @__PURE__ */ jsxs("li", {
          children: [/* @__PURE__ */ jsx("strong", {
            children: "Product feature"
          }), ". Some detail about your feature and its benefit to your customer."]
        }), /* @__PURE__ */ jsxs("li", {
          children: [/* @__PURE__ */ jsx("strong", {
            children: "Product feature"
          }), ". Some detail about your feature and its benefit to your customer."]
        }), /* @__PURE__ */ jsxs("li", {
          children: [/* @__PURE__ */ jsx("strong", {
            children: "Product feature"
          }), ". Some detail about your feature and its benefit to your customer."]
        })]
      })]
    })
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: route,
  loader: loader$9
}, Symbol.toStringTag, { value: "Module" }));
const loader$8 = async ({
  request
}) => {
  await authenticate.admin(request);
  return {
    apiKey: process.env.SHOPIFY_API_KEY || ""
  };
};
const app = UNSAFE_withComponentProps(function App3() {
  const {
    apiKey
  } = useLoaderData();
  return /* @__PURE__ */ jsxs(AppProvider, {
    embedded: true,
    apiKey,
    children: [/* @__PURE__ */ jsxs("s-app-nav", {
      children: [/* @__PURE__ */ jsx("s-link", {
        href: "/app/home",
        children: "Home"
      }), /* @__PURE__ */ jsx("s-link", {
        href: "/app/store",
        children: "Store"
      }), /* @__PURE__ */ jsx("s-link", {
        href: "/app/cart",
        children: "Cart"
      }), /* @__PURE__ */ jsx("s-link", {
        href: "/app/orders",
        children: "📦 Orders"
      }), /* @__PURE__ */ jsx("s-link", {
        href: "/app/products",
        children: "Manage Products"
      })]
    }), /* @__PURE__ */ jsx(Outlet, {})]
  });
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2() {
  return boundary.error(useRouteError());
});
const headers$1 = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: app,
  headers: headers$1,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
const loader$7 = async ({
  request,
  params
}) => {
  const {
    admin
  } = await authenticate.admin(request);
  const productId = params.id;
  const response = await admin.graphql(`#graphql
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          productType
          vendor
          featuredImage {
            url
            altText
          }
          images(first: 8) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                title
                price
                availableForSale
                inventoryQuantity
              }
            }
          }
        }
      }`, {
    variables: {
      id: `gid://shopify/Product/${productId}`
    }
  });
  const responseJson = await response.json();
  return {
    product: responseJson.data.product
  };
};
const app_product_$id = UNSAFE_withComponentProps(function ProductDetails() {
  var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const {
    product
  } = useLoaderData();
  const navigate = useNavigate();
  const shopify2 = useAppBridge();
  const addToCart = () => {
    var _a3;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({
      id: product.id,
      title: product.title,
      price: product.variants.edges[0].node.price,
      image: (_a3 = product.featuredImage) == null ? void 0 : _a3.url,
      quantity: 1
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    shopify2.toast.show("🛒 Added to cart successfully!");
  };
  const shareOnWhatsApp = () => {
    const productUrl = window.location.href;
    const price = product.variants.edges[0].node.price;
    const description = product.description || "Check out this amazing product!";
    const message = `🛍️ *${product.title}*

💰 Price: $${price}

📝 ${description}

🔗 View Product: ${productUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };
  const images = product.images.edges.map((edge) => edge.node);
  const variants = product.variants.edges.map((edge) => edge.node);
  return /* @__PURE__ */ jsxs("div", {
    style: {
      minHeight: "100vh",
      background: "#f8f9fa",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    children: [/* @__PURE__ */ jsx("div", {
      style: {
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "white",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      },
      children: /* @__PURE__ */ jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        },
        children: [/* @__PURE__ */ jsx("button", {
          onClick: () => navigate(-1),
          style: {
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          },
          children: "←"
        }), /* @__PURE__ */ jsx("h1", {
          style: {
            margin: 0,
            fontSize: "18px",
            fontWeight: "700",
            color: "#2c3e50",
            textAlign: "center",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingRight: "40px"
          },
          children: product.title
        })]
      })
    }), /* @__PURE__ */ jsxs("div", {
      style: {
        paddingBottom: "100px"
      },
      children: [/* @__PURE__ */ jsxs("div", {
        style: {
          background: "white",
          marginBottom: "8px"
        },
        children: [product.featuredImage && /* @__PURE__ */ jsx("img", {
          src: product.featuredImage.url,
          alt: product.title,
          style: {
            width: "100%",
            height: "400px",
            objectFit: "cover"
          }
        }), images.length > 1 && /* @__PURE__ */ jsx("div", {
          style: {
            padding: "16px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
            gap: "12px",
            maxWidth: "400px",
            margin: "0 auto"
          },
          children: images.slice(1, 5).map((img, idx) => /* @__PURE__ */ jsx("img", {
            src: img.url,
            alt: img.altText || product.title,
            style: {
              width: "100%",
              height: "80px",
              objectFit: "cover",
              borderRadius: "8px",
              cursor: "pointer",
              border: "2px solid transparent",
              transition: "all 0.3s ease"
            }
          }, idx))
        })]
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          background: "white",
          padding: "20px",
          marginBottom: "8px"
        },
        children: [/* @__PURE__ */ jsxs("div", {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px"
          },
          children: [/* @__PURE__ */ jsxs("div", {
            style: {
              flex: 1
            },
            children: [/* @__PURE__ */ jsx("h2", {
              style: {
                margin: "0 0 8px 0",
                fontSize: "24px",
                fontWeight: "700",
                color: "#2c3e50",
                lineHeight: "1.3"
              },
              children: product.title
            }), /* @__PURE__ */ jsxs("p", {
              style: {
                margin: "0 0 16px 0",
                fontSize: "14px",
                color: "#7f8c8d"
              },
              children: [product.productType, " • by ", product.vendor]
            })]
          }), /* @__PURE__ */ jsx("button", {
            onClick: shareOnWhatsApp,
            style: {
              background: "#25D366",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "20px",
              boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
              transition: "all 0.3s ease",
              flexShrink: 0
            },
            children: "📱"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          style: {
            fontSize: "32px",
            fontWeight: "800",
            color: "#e74c3c",
            marginBottom: "20px"
          },
          children: ["$", ((_a2 = variants[0]) == null ? void 0 : _a2.price) || "0.00"]
        }), /* @__PURE__ */ jsxs("div", {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: ((_b = variants[0]) == null ? void 0 : _b.availableForSale) ? "#d4edda" : "#f8d7da",
            border: `1px solid ${((_c = variants[0]) == null ? void 0 : _c.availableForSale) ? "#c3e6cb" : "#f5c6cb"}`
          },
          children: [/* @__PURE__ */ jsx("span", {
            style: {
              fontSize: "16px"
            },
            children: ((_d = variants[0]) == null ? void 0 : _d.availableForSale) ? "✅" : "❌"
          }), /* @__PURE__ */ jsx("span", {
            style: {
              fontSize: "14px",
              fontWeight: "600",
              color: ((_e = variants[0]) == null ? void 0 : _e.availableForSale) ? "#155724" : "#721c24"
            },
            children: ((_f = variants[0]) == null ? void 0 : _f.availableForSale) ? "In Stock - Ready to Ship" : "Currently Out of Stock"
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          background: "white",
          padding: "20px",
          marginBottom: "8px"
        },
        children: [/* @__PURE__ */ jsx("h3", {
          style: {
            margin: "0 0 16px 0",
            fontSize: "18px",
            fontWeight: "700",
            color: "#2c3e50"
          },
          children: "📝 Description"
        }), /* @__PURE__ */ jsx("p", {
          style: {
            margin: 0,
            fontSize: "16px",
            lineHeight: "1.6",
            color: "#555"
          },
          children: product.description || "Stay warm and comfortable in this versatile hoodie, perfect for layering or wearing solo. Crafted from soft, breathable fabric, it features a spacious kangaroo pocket and adjustable drawstring hood for a customized fit. The relaxed silhouette works for casual outings, workouts, or lounging at home. A wardrobe essential that transitions seamlessly from season to season."
        })]
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          background: "white",
          padding: "20px",
          marginBottom: "8px"
        },
        children: [/* @__PURE__ */ jsx("h3", {
          style: {
            margin: "0 0 16px 0",
            fontSize: "18px",
            fontWeight: "700",
            color: "#2c3e50"
          },
          children: "✨ Key Features"
        }), /* @__PURE__ */ jsxs("div", {
          style: {
            display: "grid",
            gap: "12px"
          },
          children: [/* @__PURE__ */ jsxs("div", {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px"
            },
            children: [/* @__PURE__ */ jsx("span", {
              style: {
                fontSize: "16px"
              },
              children: "🏆"
            }), /* @__PURE__ */ jsx("span", {
              style: {
                fontSize: "15px",
                color: "#555"
              },
              children: "Premium quality materials"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px"
            },
            children: [/* @__PURE__ */ jsx("span", {
              style: {
                fontSize: "16px"
              },
              children: "👌"
            }), /* @__PURE__ */ jsx("span", {
              style: {
                fontSize: "15px",
                color: "#555"
              },
              children: "Comfortable and perfect fit"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px"
            },
            children: [/* @__PURE__ */ jsx("span", {
              style: {
                fontSize: "16px"
              },
              children: "💪"
            }), /* @__PURE__ */ jsx("span", {
              style: {
                fontSize: "15px",
                color: "#555"
              },
              children: "Durable and long-lasting"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px"
            },
            children: [/* @__PURE__ */ jsx("span", {
              style: {
                fontSize: "16px"
              },
              children: "🧼"
            }), /* @__PURE__ */ jsx("span", {
              style: {
                fontSize: "15px",
                color: "#555"
              },
              children: "Easy care and maintenance"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px"
            },
            children: [/* @__PURE__ */ jsx("span", {
              style: {
                fontSize: "16px"
              },
              children: "🎨"
            }), /* @__PURE__ */ jsx("span", {
              style: {
                fontSize: "15px",
                color: "#555"
              },
              children: "Modern and stylish design"
            })]
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          background: "white",
          padding: "20px"
        },
        children: [/* @__PURE__ */ jsx("h3", {
          style: {
            margin: "0 0 16px 0",
            fontSize: "18px",
            fontWeight: "700",
            color: "#2c3e50"
          },
          children: "🎁 Why Choose Us?"
        }), /* @__PURE__ */ jsxs("div", {
          style: {
            display: "grid",
            gap: "12px"
          },
          children: [/* @__PURE__ */ jsxs("div", {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px"
            },
            children: [/* @__PURE__ */ jsx("span", {
              style: {
                fontSize: "16px"
              },
              children: "🚚"
            }), /* @__PURE__ */ jsxs("span", {
              style: {
                fontSize: "14px",
                color: "#555"
              },
              children: [/* @__PURE__ */ jsx("strong", {
                children: "Free Shipping:"
              }), " On all orders over $50"]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px"
            },
            children: [/* @__PURE__ */ jsx("span", {
              style: {
                fontSize: "16px"
              },
              children: "🔄"
            }), /* @__PURE__ */ jsxs("span", {
              style: {
                fontSize: "14px",
                color: "#555"
              },
              children: [/* @__PURE__ */ jsx("strong", {
                children: "Easy Returns:"
              }), " 30-day hassle-free returns"]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px"
            },
            children: [/* @__PURE__ */ jsx("span", {
              style: {
                fontSize: "16px"
              },
              children: "🛡️"
            }), /* @__PURE__ */ jsxs("span", {
              style: {
                fontSize: "14px",
                color: "#555"
              },
              children: [/* @__PURE__ */ jsx("strong", {
                children: "Secure Payment:"
              }), " 100% secure checkout"]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px"
            },
            children: [/* @__PURE__ */ jsx("span", {
              style: {
                fontSize: "16px"
              },
              children: "📞"
            }), /* @__PURE__ */ jsxs("span", {
              style: {
                fontSize: "14px",
                color: "#555"
              },
              children: [/* @__PURE__ */ jsx("strong", {
                children: "24/7 Support:"
              }), " Always here to help"]
            })]
          })]
        })]
      })]
    }), /* @__PURE__ */ jsx("div", {
      style: {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        padding: "16px 20px",
        borderTop: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
        zIndex: 100
      },
      children: /* @__PURE__ */ jsxs("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: "12px",
          alignItems: "center"
        },
        children: [/* @__PURE__ */ jsx("button", {
          onClick: shareOnWhatsApp,
          style: {
            background: "#25D366",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "14px 16px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
            transition: "all 0.3s ease",
            whiteSpace: "nowrap"
          },
          children: "📱 Share"
        }), /* @__PURE__ */ jsx("button", {
          onClick: addToCart,
          disabled: !((_g = variants[0]) == null ? void 0 : _g.availableForSale),
          style: {
            background: ((_h = variants[0]) == null ? void 0 : _h.availableForSale) ? "linear-gradient(135deg, #667eea, #764ba2)" : "#95a5a6",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: "700",
            cursor: ((_i = variants[0]) == null ? void 0 : _i.availableForSale) ? "pointer" : "not-allowed",
            boxShadow: ((_j = variants[0]) == null ? void 0 : _j.availableForSale) ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "none",
            transition: "all 0.3s ease",
            opacity: ((_k = variants[0]) == null ? void 0 : _k.availableForSale) ? 1 : 0.6
          },
          children: ((_l = variants[0]) == null ? void 0 : _l.availableForSale) ? "🛒 Add to Cart" : "❌ Out of Stock"
        }), /* @__PURE__ */ jsx(Link, {
          to: "/app/cart",
          style: {
            textDecoration: "none"
          },
          children: /* @__PURE__ */ jsx("button", {
            style: {
              background: "#f8f9fa",
              color: "#667eea",
              border: "2px solid #667eea",
              borderRadius: "12px",
              padding: "14px 16px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap"
            },
            children: "🛍️ Cart"
          })
        })]
      })
    })]
  });
});
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app_product_$id,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
const app_additional = UNSAFE_withComponentProps(function AdditionalPage() {
  return /* @__PURE__ */ jsxs("s-page", {
    heading: "Additional page",
    children: [/* @__PURE__ */ jsxs("s-section", {
      heading: "Multiple pages",
      children: [/* @__PURE__ */ jsxs("s-paragraph", {
        children: ["The app template comes with an additional page which demonstrates how to create multiple pages within app navigation using", " ", /* @__PURE__ */ jsx("s-link", {
          href: "https://shopify.dev/docs/apps/tools/app-bridge",
          target: "_blank",
          children: "App Bridge"
        }), "."]
      }), /* @__PURE__ */ jsxs("s-paragraph", {
        children: ["To create your own page and have it show up in the app navigation, add a page inside ", /* @__PURE__ */ jsx("code", {
          children: "app/routes"
        }), ", and a link to it in the", " ", /* @__PURE__ */ jsx("code", {
          children: "<ui-nav-menu>"
        }), " component found in", " ", /* @__PURE__ */ jsx("code", {
          children: "app/routes/app.jsx"
        }), "."]
      })]
    }), /* @__PURE__ */ jsx("s-section", {
      slot: "aside",
      heading: "Resources",
      children: /* @__PURE__ */ jsx("s-unordered-list", {
        children: /* @__PURE__ */ jsx("s-list-item", {
          children: /* @__PURE__ */ jsx("s-link", {
            href: "https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav",
            target: "_blank",
            children: "App nav best practices"
          })
        })
      })
    })]
  });
});
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app_additional
}, Symbol.toStringTag, { value: "Module" }));
const loader$6 = async ({
  request
}) => {
  await authenticate.admin(request);
  return null;
};
const action$1 = async ({
  request
}) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  const orderId = `ORD-${Date.now()}`;
  const cartData = formData.get("cart");
  const cart = JSON.parse(cartData || "[]");
  const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * (item.quantity || 1), 0);
  await prisma.order.create({
    data: {
      orderId,
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      city: formData.get("city"),
      zip: formData.get("zip"),
      items: JSON.stringify(cart),
      total: total + 10,
      status: "pending"
    }
  });
  return {
    success: true,
    orderId,
    message: "Order placed successfully!"
  };
};
const app_checkout = UNSAFE_withComponentProps(function Checkout() {
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: ""
  });
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const shopify2 = useAppBridge();
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);
  useEffect(() => {
    var _a2;
    if ((_a2 = fetcher.data) == null ? void 0 : _a2.success) {
      shopify2.toast.show(fetcher.data.message);
      localStorage.removeItem("cart");
      setTimeout(() => navigate("/app/home"), 2e3);
    }
  }, [fetcher.data, navigate, shopify2]);
  const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * (item.quantity || 1), 0);
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append("cart", JSON.stringify(cart));
    fetcher.submit(data, {
      method: "POST"
    });
  };
  return /* @__PURE__ */ jsxs("s-page", {
    heading: "Checkout",
    children: [/* @__PURE__ */ jsx("style", {
      children: `
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
      `
    }), /* @__PURE__ */ jsxs("div", {
      className: "checkout-container",
      children: [/* @__PURE__ */ jsx("s-section", {
        heading: "Shipping Information",
        children: /* @__PURE__ */ jsxs("s-stack", {
          direction: "block",
          gap: "base",
          children: [/* @__PURE__ */ jsx("s-text-field", {
            label: "Full Name",
            value: formData.name,
            onChange: (e) => setFormData({
              ...formData,
              name: e.target.value
            }),
            required: true
          }), /* @__PURE__ */ jsx("s-text-field", {
            label: "Email",
            type: "email",
            value: formData.email,
            onChange: (e) => setFormData({
              ...formData,
              email: e.target.value
            }),
            required: true
          }), /* @__PURE__ */ jsx("s-text-field", {
            label: "Phone",
            type: "tel",
            value: formData.phone,
            onChange: (e) => setFormData({
              ...formData,
              phone: e.target.value
            }),
            required: true
          }), /* @__PURE__ */ jsx("s-text-field", {
            label: "Address",
            value: formData.address,
            onChange: (e) => setFormData({
              ...formData,
              address: e.target.value
            }),
            required: true
          }), /* @__PURE__ */ jsxs("div", {
            className: "city-zip-grid",
            children: [/* @__PURE__ */ jsx("s-text-field", {
              label: "City",
              value: formData.city,
              onChange: (e) => setFormData({
                ...formData,
                city: e.target.value
              }),
              required: true
            }), /* @__PURE__ */ jsx("s-text-field", {
              label: "ZIP Code",
              value: formData.zip,
              onChange: (e) => setFormData({
                ...formData,
                zip: e.target.value
              }),
              required: true
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("s-section", {
          heading: "Order Summary",
          children: /* @__PURE__ */ jsx("s-card", {
            children: /* @__PURE__ */ jsxs("s-stack", {
              direction: "block",
              gap: "base",
              style: {
                padding: "16px"
              },
              children: [cart.map((item, index2) => /* @__PURE__ */ jsxs("div", {
                className: "order-item",
                children: [/* @__PURE__ */ jsx("s-text", {
                  children: item.title
                }), /* @__PURE__ */ jsxs("s-text", {
                  children: ["$", item.price]
                })]
              }, index2)), /* @__PURE__ */ jsxs("div", {
                className: "order-total",
                children: [/* @__PURE__ */ jsx("s-text", {
                  children: "Subtotal"
                }), /* @__PURE__ */ jsxs("s-text", {
                  children: ["$", total.toFixed(2)]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "order-total",
                children: [/* @__PURE__ */ jsx("s-text", {
                  children: "Shipping"
                }), /* @__PURE__ */ jsx("s-text", {
                  children: "$10.00"
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "final-total",
                children: [/* @__PURE__ */ jsx("s-text", {
                  weight: "bold",
                  size: "large",
                  children: "Total"
                }), /* @__PURE__ */ jsxs("s-text", {
                  weight: "bold",
                  size: "large",
                  style: {
                    color: "#2c6ecb"
                  },
                  children: ["$", (total + 10).toFixed(2)]
                })]
              })]
            })
          })
        }), /* @__PURE__ */ jsx("s-button", {
          variant: "primary",
          size: "large",
          onClick: handleSubmit,
          ...fetcher.state === "submitting" ? {
            loading: true
          } : {},
          style: {
            width: "100%",
            marginTop: "20px"
          },
          children: "Place Order"
        })]
      })]
    })]
  });
});
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: app_checkout,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
const loader$5 = async ({
  request
}) => {
  await authenticate.admin(request);
  return null;
};
const action = async ({
  request
}) => {
  const {
    admin
  } = await authenticate.admin(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const price = formData.get("price");
  const category = formData.get("category");
  const response = await admin.graphql(`#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            productType
            variants(first: 1) {
              edges {
                node {
                  id
                  price
                }
              }
            }
          }
        }
      }`, {
    variables: {
      product: {
        title,
        productType: category,
        vendor: "Your Store"
      }
    }
  });
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  if (!product || !product.variants || !product.variants.edges || product.variants.edges.length === 0) {
    throw new Error("Product creation failed or no variants found");
  }
  const variantId = product.variants.edges[0].node.id;
  await admin.graphql(`#graphql
    mutation updateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
        }
      }
    }`, {
    variables: {
      productId: product.id,
      variants: [{
        id: variantId,
        price
      }]
    }
  });
  return {
    product
  };
};
const app_products = UNSAFE_withComponentProps(function Products() {
  var _a2;
  const fetcher = useFetcher();
  const shopify2 = useAppBridge();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const isLoading = fetcher.state === "submitting";
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("category", category);
    fetcher.submit(formData, {
      method: "POST"
    });
    setTitle("");
    setPrice("");
  };
  const quickAddProducts = () => {
    const products = [{
      title: "Men's Classic T-Shirt",
      category: "Men",
      price: "29.99"
    }, {
      title: "Men's Denim Jeans",
      category: "Men",
      price: "59.99"
    }, {
      title: "Men's Casual Shirt",
      category: "Men",
      price: "39.99"
    }, {
      title: "Men's Sports Shoes",
      category: "Men",
      price: "79.99"
    }, {
      title: "Women's Summer Dress",
      category: "Women",
      price: "49.99"
    }, {
      title: "Women's Skinny Jeans",
      category: "Women",
      price: "54.99"
    }, {
      title: "Women's Blouse",
      category: "Women",
      price: "34.99"
    }, {
      title: "Women's Heels",
      category: "Women",
      price: "69.99"
    }, {
      title: "Kids' Cotton T-Shirt",
      category: "Kids",
      price: "19.99"
    }, {
      title: "Kids' Denim Shorts",
      category: "Kids",
      price: "24.99"
    }, {
      title: "Kids' Hoodie",
      category: "Kids",
      price: "29.99"
    }, {
      title: "Kids' Sneakers",
      category: "Kids",
      price: "39.99"
    }];
    products.forEach((product, index2) => {
      setTimeout(() => {
        const formData = new FormData();
        formData.append("title", product.title);
        formData.append("price", product.price);
        formData.append("category", product.category);
        fetcher.submit(formData, {
          method: "POST"
        });
      }, index2 * 1e3);
    });
    shopify2.toast.show("Adding 12 products...");
  };
  return /* @__PURE__ */ jsxs("s-page", {
    heading: "Product Management",
    children: [/* @__PURE__ */ jsx("s-button", {
      slot: "primary-action",
      onClick: quickAddProducts,
      children: "Add All 12 Products"
    }), /* @__PURE__ */ jsx("s-section", {
      heading: "Add Single Product",
      children: /* @__PURE__ */ jsxs("s-stack", {
        direction: "block",
        gap: "base",
        children: [/* @__PURE__ */ jsx("s-text-field", {
          label: "Product Title",
          value: title,
          onChange: (e) => setTitle(e.target.value),
          placeholder: "e.g., Men's Classic T-Shirt"
        }), /* @__PURE__ */ jsx("s-text-field", {
          label: "Price",
          value: price,
          onChange: (e) => setPrice(e.target.value),
          placeholder: "29.99",
          type: "number"
        }), /* @__PURE__ */ jsxs("s-select", {
          label: "Category",
          value: category,
          onChange: (e) => setCategory(e.target.value),
          children: [/* @__PURE__ */ jsx("option", {
            value: "Men",
            children: "Men"
          }), /* @__PURE__ */ jsx("option", {
            value: "Women",
            children: "Women"
          }), /* @__PURE__ */ jsx("option", {
            value: "Kids",
            children: "Kids"
          })]
        }), /* @__PURE__ */ jsx("s-button", {
          onClick: handleSubmit,
          ...isLoading ? {
            loading: true
          } : {},
          children: "Add Product"
        })]
      })
    }), ((_a2 = fetcher.data) == null ? void 0 : _a2.product) && /* @__PURE__ */ jsx("s-section", {
      heading: "Product Created Successfully",
      children: /* @__PURE__ */ jsxs("s-stack", {
        direction: "block",
        gap: "base",
        children: [/* @__PURE__ */ jsxs("s-paragraph", {
          children: [/* @__PURE__ */ jsx("s-text", {
            weight: "bold",
            children: fetcher.data.product.title
          }), " has been created!"]
        }), /* @__PURE__ */ jsx("s-button", {
          onClick: () => {
            var _a3, _b;
            (_b = (_a3 = shopify2.intents).invoke) == null ? void 0 : _b.call(_a3, "edit:shopify/Product", {
              value: fetcher.data.product.id
            });
          },
          variant: "primary",
          children: "Add Images & Edit"
        })]
      })
    }), /* @__PURE__ */ jsxs("s-section", {
      slot: "aside",
      heading: "Quick Add Products",
      children: [/* @__PURE__ */ jsx("s-paragraph", {
        children: 'Click "Add All 12 Products" to automatically add:'
      }), /* @__PURE__ */ jsxs("s-unordered-list", {
        children: [/* @__PURE__ */ jsx("s-list-item", {
          children: "4 Men's products"
        }), /* @__PURE__ */ jsx("s-list-item", {
          children: "4 Women's products"
        }), /* @__PURE__ */ jsx("s-list-item", {
          children: "4 Kids' products"
        })]
      }), /* @__PURE__ */ jsx("s-paragraph", {
        children: "After adding, you can edit each product to add images."
      })]
    })]
  });
});
const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: app_products,
  headers,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
const loader$4 = async ({
  request
}) => {
  await authenticate.admin(request);
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
  return {
    orders
  };
};
const app_orders = UNSAFE_withComponentProps(function Orders() {
  const {
    orders
  } = useLoaderData();
  return /* @__PURE__ */ jsx("s-page", {
    heading: "📦 All Orders",
    children: /* @__PURE__ */ jsx("s-section", {
      children: orders.length === 0 ? /* @__PURE__ */ jsx("s-card", {
        children: /* @__PURE__ */ jsxs("div", {
          style: {
            textAlign: "center",
            padding: "40px"
          },
          children: [/* @__PURE__ */ jsx("div", {
            style: {
              fontSize: "48px",
              marginBottom: "16px"
            },
            children: "📦"
          }), /* @__PURE__ */ jsx("s-text", {
            size: "large",
            children: "No orders yet"
          })]
        })
      }) : /* @__PURE__ */ jsx("s-stack", {
        direction: "block",
        gap: "base",
        children: orders.map((order) => {
          const items = JSON.parse(order.items);
          return /* @__PURE__ */ jsx("s-card", {
            children: /* @__PURE__ */ jsxs("div", {
              style: {
                padding: "16px"
              },
              children: [/* @__PURE__ */ jsxs("div", {
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px"
                },
                children: [/* @__PURE__ */ jsx("s-text", {
                  weight: "bold",
                  size: "large",
                  children: order.orderId
                }), /* @__PURE__ */ jsx("s-badge", {
                  status: order.status === "pending" ? "warning" : "success",
                  children: order.status
                })]
              }), /* @__PURE__ */ jsxs("div", {
                style: {
                  marginBottom: "12px"
                },
                children: [/* @__PURE__ */ jsxs("s-text", {
                  children: ["👤 ", order.name]
                }), /* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsxs("s-text", {
                  children: ["📧 ", order.email]
                }), /* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsxs("s-text", {
                  children: ["📱 ", order.phone]
                }), /* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsxs("s-text", {
                  children: ["📍 ", order.address, ", ", order.city, " - ", order.zip]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                style: {
                  borderTop: "1px solid #e1e3e5",
                  paddingTop: "12px",
                  marginTop: "12px"
                },
                children: [/* @__PURE__ */ jsx("s-text", {
                  weight: "bold",
                  children: "Items:"
                }), items.map((item, idx) => /* @__PURE__ */ jsx("div", {
                  style: {
                    marginTop: "8px"
                  },
                  children: /* @__PURE__ */ jsxs("s-text", {
                    children: ["• ", item.title, " - $", item.price, " x ", item.quantity || 1]
                  })
                }, idx))]
              }), /* @__PURE__ */ jsxs("div", {
                style: {
                  borderTop: "1px solid #e1e3e5",
                  paddingTop: "12px",
                  marginTop: "12px"
                },
                children: [/* @__PURE__ */ jsxs("s-text", {
                  weight: "bold",
                  size: "large",
                  style: {
                    color: "#2c6ecb"
                  },
                  children: ["Total: $", order.total.toFixed(2)]
                }), /* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsx("s-text", {
                  size: "small",
                  style: {
                    color: "#666"
                  },
                  children: new Date(order.createdAt).toLocaleString()
                })]
              })]
            })
          }, order.id);
        })
      })
    })
  });
});
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app_orders,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
const loader$3 = async ({
  request
}) => {
  await authenticate.admin(request);
  return null;
};
const app__index = UNSAFE_withComponentProps(function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/app/home", {
      replace: true
    });
  }, [navigate]);
  return /* @__PURE__ */ jsxs("div", {
    style: {
      padding: "40px",
      textAlign: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "12px",
      color: "white"
    },
    children: [/* @__PURE__ */ jsx("h2", {
      style: {
        marginBottom: "20px",
        fontSize: "24px"
      },
      children: "🚀 Loading WajahatEcom..."
    }), /* @__PURE__ */ jsx("p", {
      style: {
        fontSize: "16px",
        opacity: 0.9
      },
      children: "Taking you to the home page..."
    }), /* @__PURE__ */ jsx("div", {
      style: {
        marginTop: "20px",
        width: "50px",
        height: "50px",
        border: "3px solid rgba(255,255,255,0.3)",
        borderTop: "3px solid white",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: "20px auto"
      }
    }), /* @__PURE__ */ jsx("style", {
      children: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `
    })]
  });
});
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app__index,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const loader$2 = async ({
  request
}) => {
  const {
    admin
  } = await authenticate.admin(request);
  const response = await admin.graphql(`#graphql
      query getProducts {
        products(first: 50) {
          edges {
            node {
              id
              title
              description
              productType
              featuredImage {
                url
                altText
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                  }
                }
              }
            }
          }
        }
      }`);
  const responseJson = await response.json();
  const products = responseJson.data.products.edges.map((edge) => edge.node);
  const menProducts = products.filter((p) => p.productType === "Men");
  const womenProducts = products.filter((p) => p.productType === "Women");
  const kidsProducts = products.filter((p) => p.productType === "Kids");
  return {
    menProducts,
    womenProducts,
    kidsProducts
  };
};
const app_store = UNSAFE_withComponentProps(function Store() {
  const {
    menProducts,
    womenProducts,
    kidsProducts
  } = useLoaderData();
  useAppBridge();
  const ProductCard = ({
    product
  }) => {
    product.id.split("/").pop();
    const shopify2 = useAppBridge();
    const addToCart = () => {
      var _a2;
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart.push({
        id: product.id,
        title: product.title,
        price: product.variants.edges[0].node.price,
        image: (_a2 = product.featuredImage) == null ? void 0 : _a2.url
      });
      localStorage.setItem("cart", JSON.stringify(cart));
      shopify2.toast.show("Added to cart!");
    };
    return /* @__PURE__ */ jsxs("s-card", {
      children: [product.featuredImage && /* @__PURE__ */ jsx("img", {
        src: product.featuredImage.url,
        alt: product.featuredImage.altText || product.title,
        style: {
          width: "100%",
          height: "250px",
          objectFit: "cover",
          borderRadius: "8px 8px 0 0"
        }
      }), /* @__PURE__ */ jsxs("s-stack", {
        direction: "block",
        gap: "tight",
        style: {
          padding: "16px"
        },
        children: [/* @__PURE__ */ jsx("s-text", {
          weight: "bold",
          size: "large",
          children: product.title
        }), /* @__PURE__ */ jsxs("s-text", {
          size: "large",
          style: {
            color: "#2c6ecb"
          },
          children: ["$", product.variants.edges[0].node.price]
        }), /* @__PURE__ */ jsx("s-button", {
          variant: "primary",
          style: {
            marginTop: "8px"
          },
          onClick: addToCart,
          children: "Add to Cart"
        })]
      })]
    });
  };
  return /* @__PURE__ */ jsxs("s-page", {
    heading: "Shop",
    children: [/* @__PURE__ */ jsx("s-section", {
      heading: `Men's Collection (${menProducts.length})`,
      children: /* @__PURE__ */ jsx("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "16px"
        },
        children: menProducts.map((product) => /* @__PURE__ */ jsx(ProductCard, {
          product
        }, product.id))
      })
    }), /* @__PURE__ */ jsx("s-section", {
      heading: `Women's Collection (${womenProducts.length})`,
      children: /* @__PURE__ */ jsx("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "16px"
        },
        children: womenProducts.map((product) => /* @__PURE__ */ jsx(ProductCard, {
          product
        }, product.id))
      })
    }), /* @__PURE__ */ jsx("s-section", {
      heading: `Kids' Collection (${kidsProducts.length})`,
      children: /* @__PURE__ */ jsx("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "16px"
        },
        children: kidsProducts.map((product) => /* @__PURE__ */ jsx(ProductCard, {
          product
        }, product.id))
      })
    })]
  });
});
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app_store,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const loader$1 = async ({
  request
}) => {
  await authenticate.admin(request);
  return null;
};
const app_cart = UNSAFE_withComponentProps(function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const shopify2 = useAppBridge();
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);
  const removeFromCart = (index2) => {
    const newCart = cart.filter((_, i) => i !== index2);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    shopify2.toast.show("🗑️ Removed from cart");
  };
  const updateQuantity = (index2, change) => {
    const newCart = [...cart];
    const currentQty = newCart[index2].quantity || 1;
    const newQty = Math.max(1, currentQty + change);
    newCart[index2].quantity = newQty;
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };
  const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * (item.quantity || 1), 0);
  const checkout = () => {
    shopify2.toast.show("🚀 Proceeding to checkout...");
    navigate("/app/checkout");
  };
  return /* @__PURE__ */ jsxs("div", {
    style: {
      minHeight: "100vh",
      background: "#f8f9fa",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    children: [/* @__PURE__ */ jsx("div", {
      style: {
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "white",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      },
      children: /* @__PURE__ */ jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "16px"
        },
        children: [/* @__PURE__ */ jsx("button", {
          onClick: () => navigate(-1),
          style: {
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          },
          children: "←"
        }), /* @__PURE__ */ jsxs("h1", {
          style: {
            margin: 0,
            fontSize: "20px",
            fontWeight: "700",
            color: "#2c3e50"
          },
          children: ["Shopping Cart (", cart.length, ")"]
        })]
      })
    }), /* @__PURE__ */ jsx("div", {
      style: {
        padding: "20px",
        paddingBottom: "100px"
      },
      children: cart.length === 0 ? /* @__PURE__ */ jsxs("div", {
        style: {
          textAlign: "center",
          padding: "60px 20px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        },
        children: [/* @__PURE__ */ jsx("div", {
          style: {
            fontSize: "64px",
            marginBottom: "20px"
          },
          children: "🛍️"
        }), /* @__PURE__ */ jsx("h2", {
          style: {
            margin: "0 0 12px 0",
            fontSize: "24px",
            fontWeight: "700",
            color: "#2c3e50"
          },
          children: "Your cart is empty"
        }), /* @__PURE__ */ jsx("p", {
          style: {
            margin: "0 0 24px 0",
            fontSize: "16px",
            color: "#7f8c8d"
          },
          children: "Add some products to get started!"
        }), /* @__PURE__ */ jsx(Link, {
          to: "/app/store",
          style: {
            textDecoration: "none"
          },
          children: /* @__PURE__ */ jsx("button", {
            style: {
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "16px 32px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              transition: "all 0.3s ease"
            },
            children: "🛒 Start Shopping"
          })
        })]
      }) : /* @__PURE__ */ jsxs(Fragment, {
        children: [/* @__PURE__ */ jsx("div", {
          style: {
            marginBottom: "20px"
          },
          children: cart.map((item, index2) => /* @__PURE__ */ jsx("div", {
            style: {
              background: "white",
              borderRadius: "16px",
              padding: "16px",
              marginBottom: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            },
            children: /* @__PURE__ */ jsxs("div", {
              style: {
                display: "flex",
                gap: "16px",
                alignItems: "center"
              },
              children: [item.image && /* @__PURE__ */ jsx("img", {
                src: item.image,
                alt: item.title,
                style: {
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  flexShrink: 0
                }
              }), /* @__PURE__ */ jsxs("div", {
                style: {
                  flex: 1,
                  minWidth: 0
                },
                children: [/* @__PURE__ */ jsx("h3", {
                  style: {
                    margin: "0 0 8px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#2c3e50",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  },
                  children: item.title
                }), /* @__PURE__ */ jsxs("div", {
                  style: {
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#e74c3c",
                    marginBottom: "12px"
                  },
                  children: ["$", item.price]
                }), /* @__PURE__ */ jsxs("div", {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  },
                  children: [/* @__PURE__ */ jsxs("div", {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      background: "#f8f9fa",
                      borderRadius: "8px",
                      padding: "4px"
                    },
                    children: [/* @__PURE__ */ jsx("button", {
                      onClick: () => updateQuantity(index2, -1),
                      style: {
                        background: "none",
                        border: "none",
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#667eea"
                      },
                      children: "-"
                    }), /* @__PURE__ */ jsx("span", {
                      style: {
                        minWidth: "40px",
                        textAlign: "center",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#2c3e50"
                      },
                      children: item.quantity || 1
                    }), /* @__PURE__ */ jsx("button", {
                      onClick: () => updateQuantity(index2, 1),
                      style: {
                        background: "none",
                        border: "none",
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#667eea"
                      },
                      children: "+"
                    })]
                  }), /* @__PURE__ */ jsx("button", {
                    onClick: () => removeFromCart(index2),
                    style: {
                      background: "#fee",
                      color: "#e74c3c",
                      border: "1px solid #fcc",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    },
                    children: "🗑️ Remove"
                  })]
                })]
              })]
            })
          }, index2))
        }), /* @__PURE__ */ jsxs("div", {
          style: {
            background: "white",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginBottom: "20px"
          },
          children: [/* @__PURE__ */ jsx("h3", {
            style: {
              margin: "0 0 16px 0",
              fontSize: "18px",
              fontWeight: "700",
              color: "#2c3e50"
            },
            children: "Order Summary"
          }), /* @__PURE__ */ jsxs("div", {
            style: {
              borderTop: "1px solid #e9ecef",
              paddingTop: "16px"
            },
            children: [/* @__PURE__ */ jsxs("div", {
              style: {
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px"
              },
              children: [/* @__PURE__ */ jsxs("span", {
                style: {
                  color: "#7f8c8d"
                },
                children: ["Subtotal (", cart.reduce((sum, item) => sum + (item.quantity || 1), 0), " items)"]
              }), /* @__PURE__ */ jsxs("span", {
                style: {
                  fontWeight: "600"
                },
                children: ["$", total.toFixed(2)]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              style: {
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px"
              },
              children: [/* @__PURE__ */ jsx("span", {
                style: {
                  color: "#7f8c8d"
                },
                children: "Shipping"
              }), /* @__PURE__ */ jsx("span", {
                style: {
                  fontWeight: "600",
                  color: "#27ae60"
                },
                children: "Free"
              })]
            }), /* @__PURE__ */ jsxs("div", {
              style: {
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px"
              },
              children: [/* @__PURE__ */ jsx("span", {
                style: {
                  color: "#7f8c8d"
                },
                children: "Tax"
              }), /* @__PURE__ */ jsxs("span", {
                style: {
                  fontWeight: "600"
                },
                children: ["$", (total * 0.08).toFixed(2)]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              style: {
                borderTop: "2px solid #e9ecef",
                paddingTop: "12px",
                display: "flex",
                justifyContent: "space-between"
              },
              children: [/* @__PURE__ */ jsx("span", {
                style: {
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#2c3e50"
                },
                children: "Total"
              }), /* @__PURE__ */ jsxs("span", {
                style: {
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#e74c3c"
                },
                children: ["$", (total + total * 0.08).toFixed(2)]
              })]
            })]
          })]
        })]
      })
    }), cart.length > 0 && /* @__PURE__ */ jsx("div", {
      style: {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        padding: "16px 20px",
        borderTop: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
        zIndex: 100
      },
      children: /* @__PURE__ */ jsxs("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px"
        },
        children: [/* @__PURE__ */ jsx(Link, {
          to: "/app/store",
          style: {
            textDecoration: "none"
          },
          children: /* @__PURE__ */ jsx("button", {
            style: {
              width: "100%",
              background: "#f8f9fa",
              color: "#667eea",
              border: "2px solid #667eea",
              borderRadius: "12px",
              padding: "16px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease"
            },
            children: "🛒 Continue Shopping"
          })
        }), /* @__PURE__ */ jsxs("button", {
          onClick: checkout,
          style: {
            width: "100%",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            transition: "all 0.3s ease"
          },
          children: ["🚀 Checkout $", (total + total * 0.08).toFixed(2)]
        })]
      })
    })]
  });
});
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app_cart,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const loader = async ({
  request
}) => {
  const {
    admin
  } = await authenticate.admin(request);
  const response = await admin.graphql(`#graphql
      query getProducts {
        products(first: 6) {
          edges {
            node {
              id
              title
              productType
              featuredImage {
                url
                altText
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                  }
                }
              }
            }
          }
        }
      }`);
  const responseJson = await response.json();
  const featuredProducts = responseJson.data.products.edges.map((edge) => edge.node);
  return {
    featuredProducts
  };
};
const app_home = UNSAFE_withComponentProps(function Home() {
  const {
    featuredProducts
  } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", {
    style: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    children: [/* @__PURE__ */ jsx("div", {
      style: {
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        padding: "12px 20px",
        borderBottom: "1px solid rgba(0,0,0,0.1)"
      },
      children: /* @__PURE__ */ jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        },
        children: [/* @__PURE__ */ jsx("h1", {
          style: {
            margin: 0,
            fontSize: "20px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          },
          children: "WajahatEcom"
        }), /* @__PURE__ */ jsxs("div", {
          style: {
            display: "flex",
            gap: "12px"
          },
          children: [/* @__PURE__ */ jsx(Link, {
            to: "/app/cart",
            style: {
              textDecoration: "none"
            },
            children: /* @__PURE__ */ jsx("div", {
              style: {
                width: "40px",
                height: "40px",
                borderRadius: "20px",
                background: "#f8f9fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px"
              },
              children: "🛒"
            })
          }), /* @__PURE__ */ jsx("div", {
            style: {
              width: "40px",
              height: "40px",
              borderRadius: "20px",
              background: "#f8f9fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px"
            },
            children: "👤"
          })]
        })]
      })
    }), /* @__PURE__ */ jsxs("div", {
      style: {
        padding: "40px 20px",
        textAlign: "center",
        color: "white"
      },
      children: [/* @__PURE__ */ jsx("h2", {
        style: {
          margin: "0 0 16px 0",
          fontSize: "32px",
          fontWeight: "800",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)"
        },
        children: "Shop Premium Fashion"
      }), /* @__PURE__ */ jsx("p", {
        style: {
          margin: "0 0 32px 0",
          fontSize: "16px",
          opacity: 0.9,
          lineHeight: "1.5"
        },
        children: "Discover the latest trends for men, women & kids"
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: "25px",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        },
        children: [/* @__PURE__ */ jsx("span", {
          style: {
            fontSize: "16px"
          },
          children: "🔍"
        }), /* @__PURE__ */ jsx("input", {
          type: "text",
          placeholder: "Search products...",
          style: {
            background: "transparent",
            border: "none",
            outline: "none",
            color: "white",
            fontSize: "16px",
            flex: 1,
            "::placeholder": {
              color: "rgba(255, 255, 255, 0.7)"
            }
          }
        })]
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          maxWidth: "300px",
          margin: "0 auto"
        },
        children: [/* @__PURE__ */ jsx(Link, {
          to: "/app/store",
          style: {
            textDecoration: "none"
          },
          children: /* @__PURE__ */ jsxs("div", {
            style: {
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              padding: "16px",
              textAlign: "center",
              color: "white",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              transition: "all 0.3s ease"
            },
            children: [/* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "24px",
                marginBottom: "8px"
              },
              children: "🛍️"
            }), /* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "14px",
                fontWeight: "600"
              },
              children: "Shop Now"
            })]
          })
        }), /* @__PURE__ */ jsx(Link, {
          to: "/app/products",
          style: {
            textDecoration: "none"
          },
          children: /* @__PURE__ */ jsxs("div", {
            style: {
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              padding: "16px",
              textAlign: "center",
              color: "white",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              transition: "all 0.3s ease"
            },
            children: [/* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "24px",
                marginBottom: "8px"
              },
              children: "📱"
            }), /* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "14px",
                fontWeight: "600"
              },
              children: "Products"
            })]
          })
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      style: {
        background: "#f8f9fa",
        borderTopLeftRadius: "24px",
        borderTopRightRadius: "24px",
        minHeight: "60vh",
        padding: "24px 20px"
      },
      children: [/* @__PURE__ */ jsxs("div", {
        style: {
          marginBottom: "32px"
        },
        children: [/* @__PURE__ */ jsx("h3", {
          style: {
            margin: "0 0 20px 0",
            fontSize: "20px",
            fontWeight: "700",
            color: "#2c3e50"
          },
          children: "Shop by Category"
        }), /* @__PURE__ */ jsxs("div", {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px"
          },
          children: [/* @__PURE__ */ jsx(Link, {
            to: "/app/store",
            style: {
              textDecoration: "none"
            },
            children: /* @__PURE__ */ jsxs("div", {
              style: {
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                height: "120px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              },
              children: [/* @__PURE__ */ jsx("div", {
                style: {
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "url('/men.webp')",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }
              }), /* @__PURE__ */ jsx("div", {
                style: {
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                },
                children: /* @__PURE__ */ jsxs("div", {
                  style: {
                    color: "white",
                    textAlign: "center"
                  },
                  children: [/* @__PURE__ */ jsx("div", {
                    style: {
                      fontSize: "24px",
                      marginBottom: "4px"
                    },
                    children: "👔"
                  }), /* @__PURE__ */ jsx("div", {
                    style: {
                      fontSize: "14px",
                      fontWeight: "600"
                    },
                    children: "Men's"
                  })]
                })
              })]
            })
          }), /* @__PURE__ */ jsx(Link, {
            to: "/app/store",
            style: {
              textDecoration: "none"
            },
            children: /* @__PURE__ */ jsxs("div", {
              style: {
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                height: "120px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              },
              children: [/* @__PURE__ */ jsx("div", {
                style: {
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "url('/beauty.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }
              }), /* @__PURE__ */ jsx("div", {
                style: {
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                },
                children: /* @__PURE__ */ jsxs("div", {
                  style: {
                    color: "white",
                    textAlign: "center"
                  },
                  children: [/* @__PURE__ */ jsx("div", {
                    style: {
                      fontSize: "24px",
                      marginBottom: "4px"
                    },
                    children: "👗"
                  }), /* @__PURE__ */ jsx("div", {
                    style: {
                      fontSize: "14px",
                      fontWeight: "600"
                    },
                    children: "Women's"
                  })]
                })
              })]
            })
          }), /* @__PURE__ */ jsx(Link, {
            to: "/app/store",
            style: {
              textDecoration: "none"
            },
            children: /* @__PURE__ */ jsxs("div", {
              style: {
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                height: "120px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              },
              children: [/* @__PURE__ */ jsx("div", {
                style: {
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "url('/Kid.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }
              }), /* @__PURE__ */ jsx("div", {
                style: {
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                },
                children: /* @__PURE__ */ jsxs("div", {
                  style: {
                    color: "white",
                    textAlign: "center"
                  },
                  children: [/* @__PURE__ */ jsx("div", {
                    style: {
                      fontSize: "24px",
                      marginBottom: "4px"
                    },
                    children: "👶"
                  }), /* @__PURE__ */ jsx("div", {
                    style: {
                      fontSize: "14px",
                      fontWeight: "600"
                    },
                    children: "Kids"
                  })]
                })
              })]
            })
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsxs("div", {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          },
          children: [/* @__PURE__ */ jsx("h3", {
            style: {
              margin: 0,
              fontSize: "20px",
              fontWeight: "700",
              color: "#2c3e50"
            },
            children: "Featured Products"
          }), /* @__PURE__ */ jsx(Link, {
            to: "/app/store",
            style: {
              textDecoration: "none",
              color: "#667eea",
              fontSize: "14px",
              fontWeight: "600"
            },
            children: "View All"
          })]
        }), /* @__PURE__ */ jsx("div", {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px"
          },
          children: featuredProducts.slice(0, 4).map((product) => {
            const productId = product.id.split("/").pop();
            return /* @__PURE__ */ jsx(Link, {
              to: `/app/product/${productId}`,
              style: {
                textDecoration: "none"
              },
              children: /* @__PURE__ */ jsxs("div", {
                style: {
                  background: "white",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s ease"
                },
                children: [product.featuredImage && /* @__PURE__ */ jsx("img", {
                  src: product.featuredImage.url,
                  alt: product.title,
                  style: {
                    width: "100%",
                    height: "140px",
                    objectFit: "cover"
                  }
                }), /* @__PURE__ */ jsxs("div", {
                  style: {
                    padding: "12px"
                  },
                  children: [/* @__PURE__ */ jsx("h4", {
                    style: {
                      margin: "0 0 4px 0",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#2c3e50",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    },
                    children: product.title
                  }), /* @__PURE__ */ jsx("p", {
                    style: {
                      margin: "0 0 8px 0",
                      fontSize: "12px",
                      color: "#7f8c8d"
                    },
                    children: product.productType
                  }), /* @__PURE__ */ jsxs("div", {
                    style: {
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#e74c3c"
                    },
                    children: ["$", product.variants.edges[0].node.price]
                  })]
                })]
              })
            }, product.id);
          })
        })]
      }), /* @__PURE__ */ jsx("div", {
        style: {
          marginTop: "32px",
          padding: "24px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        },
        children: /* @__PURE__ */ jsxs("div", {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
            textAlign: "center"
          },
          children: [/* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "24px",
                marginBottom: "8px"
              },
              children: "🚚"
            }), /* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "12px",
                fontWeight: "600",
                color: "#2c3e50"
              },
              children: "Free Shipping"
            }), /* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "10px",
                color: "#7f8c8d"
              },
              children: "On orders $50+"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "24px",
                marginBottom: "8px"
              },
              children: "🔄"
            }), /* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "12px",
                fontWeight: "600",
                color: "#2c3e50"
              },
              children: "Easy Returns"
            }), /* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "10px",
                color: "#7f8c8d"
              },
              children: "30-day policy"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "24px",
                marginBottom: "8px"
              },
              children: "🛡️"
            }), /* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "12px",
                fontWeight: "600",
                color: "#2c3e50"
              },
              children: "Secure Pay"
            }), /* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "10px",
                color: "#7f8c8d"
              },
              children: "100% secure"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "24px",
                marginBottom: "8px"
              },
              children: "📞"
            }), /* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "12px",
                fontWeight: "600",
                color: "#2c3e50"
              },
              children: "24/7 Support"
            }), /* @__PURE__ */ jsx("div", {
              style: {
                fontSize: "10px",
                color: "#7f8c8d"
              },
              children: "Always here"
            })]
          })]
        })
      })]
    }), /* @__PURE__ */ jsxs("div", {
      style: {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        borderTop: "1px solid rgba(0,0,0,0.1)",
        padding: "12px 20px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "8px",
        zIndex: 100
      },
      children: [/* @__PURE__ */ jsxs(Link, {
        to: "/app/home",
        style: {
          textDecoration: "none",
          textAlign: "center"
        },
        children: [/* @__PURE__ */ jsx("div", {
          style: {
            fontSize: "20px",
            marginBottom: "4px"
          },
          children: "🏠"
        }), /* @__PURE__ */ jsx("div", {
          style: {
            fontSize: "10px",
            color: "#667eea",
            fontWeight: "600"
          },
          children: "Home"
        })]
      }), /* @__PURE__ */ jsxs(Link, {
        to: "/app/store",
        style: {
          textDecoration: "none",
          textAlign: "center"
        },
        children: [/* @__PURE__ */ jsx("div", {
          style: {
            fontSize: "20px",
            marginBottom: "4px"
          },
          children: "🛍️"
        }), /* @__PURE__ */ jsx("div", {
          style: {
            fontSize: "10px",
            color: "#7f8c8d"
          },
          children: "Shop"
        })]
      }), /* @__PURE__ */ jsxs(Link, {
        to: "/app/cart",
        style: {
          textDecoration: "none",
          textAlign: "center"
        },
        children: [/* @__PURE__ */ jsx("div", {
          style: {
            fontSize: "20px",
            marginBottom: "4px"
          },
          children: "🛒"
        }), /* @__PURE__ */ jsx("div", {
          style: {
            fontSize: "10px",
            color: "#7f8c8d"
          },
          children: "Cart"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          textAlign: "center"
        },
        children: [/* @__PURE__ */ jsx("div", {
          style: {
            fontSize: "20px",
            marginBottom: "4px"
          },
          children: "👤"
        }), /* @__PURE__ */ jsx("div", {
          style: {
            fontSize: "10px",
            color: "#7f8c8d"
          },
          children: "Profile"
        })]
      })]
    }), /* @__PURE__ */ jsx("div", {
      style: {
        height: "80px"
      }
    })]
  });
});
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app_home,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-CY17hciE.js", "imports": ["/assets/chunk-LFPYN7LY-yn807eHW.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/root-CYjwkmYs.js", "imports": ["/assets/chunk-LFPYN7LY-yn807eHW.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/webhooks.app.scopes_update": { "id": "routes/webhooks.app.scopes_update", "parentId": "root", "path": "webhooks/app/scopes_update", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.scopes_update-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/webhooks.app.uninstalled": { "id": "routes/webhooks.app.uninstalled", "parentId": "root", "path": "webhooks/app/uninstalled", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.uninstalled-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth.login": { "id": "routes/auth.login", "parentId": "root", "path": "auth/login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/route-C2Gd-rOv.js", "imports": ["/assets/chunk-LFPYN7LY-yn807eHW.js", "/assets/AppProxyProvider-CYgivdql.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth.$": { "id": "routes/auth.$", "parentId": "root", "path": "auth/*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/auth._-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/route-8j2ocSEL.js", "imports": ["/assets/chunk-LFPYN7LY-yn807eHW.js"], "css": ["/assets/route-CNPfFM0M.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app": { "id": "routes/app", "parentId": "root", "path": "app", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/app-B9mUh8k6.js", "imports": ["/assets/chunk-LFPYN7LY-yn807eHW.js", "/assets/AppProxyProvider-CYgivdql.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.product.$id": { "id": "routes/app.product.$id", "parentId": "routes/app", "path": "product/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/app.product._id-CLKgfNl2.js", "imports": ["/assets/chunk-LFPYN7LY-yn807eHW.js", "/assets/useAppBridge-Bj34gXAL.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.additional": { "id": "routes/app.additional", "parentId": "routes/app", "path": "additional", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/app.additional-CQSqxafk.js", "imports": ["/assets/chunk-LFPYN7LY-yn807eHW.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.checkout": { "id": "routes/app.checkout", "parentId": "routes/app", "path": "checkout", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/app.checkout-CLs8gvgL.js", "imports": ["/assets/chunk-LFPYN7LY-yn807eHW.js", "/assets/useAppBridge-Bj34gXAL.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.products": { "id": "routes/app.products", "parentId": "routes/app", "path": "products", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/app.products-DWhp8l3U.js", "imports": ["/assets/chunk-LFPYN7LY-yn807eHW.js", "/assets/useAppBridge-Bj34gXAL.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.orders": { "id": "routes/app.orders", "parentId": "routes/app", "path": "orders", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/app.orders-DulnaCqZ.js", "imports": ["/assets/chunk-LFPYN7LY-yn807eHW.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app._index": { "id": "routes/app._index", "parentId": "routes/app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/app._index-BDk6Qqc3.js", "imports": ["/assets/chunk-LFPYN7LY-yn807eHW.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.store": { "id": "routes/app.store", "parentId": "routes/app", "path": "store", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/app.store-DYOgSFWG.js", "imports": ["/assets/chunk-LFPYN7LY-yn807eHW.js", "/assets/useAppBridge-Bj34gXAL.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.cart": { "id": "routes/app.cart", "parentId": "routes/app", "path": "cart", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/app.cart-BXHh9aji.js", "imports": ["/assets/chunk-LFPYN7LY-yn807eHW.js", "/assets/useAppBridge-Bj34gXAL.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.home": { "id": "routes/app.home", "parentId": "routes/app", "path": "home", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/app.home-DXLB4Dq2.js", "imports": ["/assets/chunk-LFPYN7LY-yn807eHW.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-cc8bb244.js", "version": "cc8bb244", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/webhooks.app.scopes_update": {
    id: "routes/webhooks.app.scopes_update",
    parentId: "root",
    path: "webhooks/app/scopes_update",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/webhooks.app.uninstalled": {
    id: "routes/webhooks.app.uninstalled",
    parentId: "root",
    path: "webhooks/app/uninstalled",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/auth.login": {
    id: "routes/auth.login",
    parentId: "root",
    path: "auth/login",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/auth.$": {
    id: "routes/auth.$",
    parentId: "root",
    path: "auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route5
  },
  "routes/app": {
    id: "routes/app",
    parentId: "root",
    path: "app",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/app.product.$id": {
    id: "routes/app.product.$id",
    parentId: "routes/app",
    path: "product/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/app.additional": {
    id: "routes/app.additional",
    parentId: "routes/app",
    path: "additional",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/app.checkout": {
    id: "routes/app.checkout",
    parentId: "routes/app",
    path: "checkout",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/app.products": {
    id: "routes/app.products",
    parentId: "routes/app",
    path: "products",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/app.orders": {
    id: "routes/app.orders",
    parentId: "routes/app",
    path: "orders",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "routes/app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route12
  },
  "routes/app.store": {
    id: "routes/app.store",
    parentId: "routes/app",
    path: "store",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  },
  "routes/app.cart": {
    id: "routes/app.cart",
    parentId: "routes/app",
    path: "cart",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "routes/app.home": {
    id: "routes/app.home",
    parentId: "routes/app",
    path: "home",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
