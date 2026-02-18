(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/components/PropertyMap.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PropertyMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/MapContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/TileLayer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/hooks.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2e$markercluster$2f$dist$2f$leaflet$2e$markercluster$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet.markercluster/dist/leaflet.markercluster-src.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
// Fix Leaflet default marker icons in Next.js
const fixLeafletIcons = ()=>{
    delete __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Icon.Default.prototype._getIconUrl;
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
    });
};
// Create custom marker icon based on property type
const createPropertyIcon = (type, price)=>{
    const getColor = ()=>{
        switch(type){
            case 'monthly_mansion':
                return '#3B82F6'; // blue
            case 'weekly_mansion':
                return '#10B981'; // green
            case 'apartment':
                return '#8B5CF6'; // purple
            default:
                return '#6B7280'; // gray
        }
    };
    const color = getColor();
    const priceText = price >= 100000 ? `¥${(price / 10000).toFixed(0)}万` : `¥${(price / 1000).toFixed(0)}K`;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        background-color: ${color};
        color: white;
        padding: 4px 8px;
        border-radius: 16px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 50px;
      ">
        ${priceText}
      </div>
    `,
        iconSize: [
            60,
            30
        ],
        iconAnchor: [
            30,
            15
        ],
        popupAnchor: [
            0,
            -15
        ]
    });
};
// Marker Cluster Group component
function MarkerClusterGroup({ properties }) {
    _s();
    const map = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"])();
    const clusterRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MarkerClusterGroup.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            // Initialize marker cluster group
            const markerCluster = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].markerClusterGroup({
                chunkedLoading: true,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: true,
                zoomToBoundsOnClick: true,
                maxClusterRadius: 80,
                iconCreateFunction: {
                    "MarkerClusterGroup.useEffect.markerCluster": (cluster)=>{
                        const childCount = cluster.getChildCount();
                        let size = 'small';
                        let color = '#3B82F6';
                        if (childCount >= 100) {
                            size = 'large';
                            color = '#DC2626';
                        } else if (childCount >= 50) {
                            size = 'large';
                            color = '#EF4444';
                        } else if (childCount >= 20) {
                            size = 'medium';
                            color = '#F59E0B';
                        }
                        const sizePx = size === 'large' ? 50 : size === 'medium' ? 40 : 30;
                        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].divIcon({
                            html: `<div style="
            background-color: ${color};
            width: ${sizePx}px;
            height: ${sizePx}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: ${size === 'large' ? '14px' : '12px'};
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">${childCount}</div>`,
                            className: 'marker-cluster',
                            iconSize: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].point(sizePx, sizePx)
                        });
                    }
                }["MarkerClusterGroup.useEffect.markerCluster"]
            });
            clusterRef.current = markerCluster;
            map.addLayer(markerCluster);
            return ({
                "MarkerClusterGroup.useEffect": ()=>{
                    if (clusterRef.current) {
                        map.removeLayer(clusterRef.current);
                    }
                }
            })["MarkerClusterGroup.useEffect"];
        }
    }["MarkerClusterGroup.useEffect"], [
        map
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MarkerClusterGroup.useEffect": ()=>{
            if (!clusterRef.current) return;
            // Clear existing markers
            clusterRef.current.clearLayers();
            // Add markers for each property
            const markers = [];
            properties.forEach({
                "MarkerClusterGroup.useEffect": (property)=>{
                    if (!property.lat || !property.lng) return;
                    const marker = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].marker([
                        property.lat,
                        property.lng
                    ], {
                        icon: createPropertyIcon(property.type, property.price)
                    });
                    const popupContent = document.createElement('div');
                    popupContent.innerHTML = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          <div style="position: relative; margin: -12px -12px 8px -12px;">
            <img 
              src="${property.photos?.[0] || '/placeholder-property.jpg'}" 
              alt="${property.location}"
              style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px 4px 0 0;"
            />
            ${property.furnished ? '<span style="position: absolute; top: 4px; left: 4px; background: #10B981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">Furnished</span>' : ''}
          </div>
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${property.location}</h3>
          <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #3B82F6;">
            ¥${property.price.toLocaleString()}/month
          </p>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B7280;">
            ${property.nearestStation} • ${property.walkTime} min walk
          </p>
          <a 
            href="/property/${property.id}" 
            style="
              display: block; 
              text-align: center; 
              background: #3B82F6; 
              color: white; 
              padding: 6px 12px; 
              border-radius: 6px; 
              text-decoration: none; 
              font-size: 12px;
              font-weight: 500;
            "
          >
            View Details →
          </a>
        </div>
      `;
                    marker.bindPopup(popupContent);
                    markers.push(marker);
                }
            }["MarkerClusterGroup.useEffect"]);
            clusterRef.current.addLayers(markers);
        }
    }["MarkerClusterGroup.useEffect"], [
        properties
    ]);
    return null;
}
_s(MarkerClusterGroup, "H0Bs8TE45TnmxK5ecHftYxYBuwo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"]
    ];
});
_c = MarkerClusterGroup;
// Map bounds fitter
function MapBoundsFitter({ properties }) {
    _s1();
    const map = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapBoundsFitter.useEffect": ()=>{
            if (properties.length === 0) return;
            const validProperties = properties.filter({
                "MapBoundsFitter.useEffect.validProperties": (p)=>p.lat && p.lng
            }["MapBoundsFitter.useEffect.validProperties"]);
            if (validProperties.length === 0) return;
            if (validProperties.length === 1) {
                map.setView([
                    validProperties[0].lat,
                    validProperties[0].lng
                ], 15);
            } else {
                const bounds = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].latLngBounds(validProperties.map({
                    "MapBoundsFitter.useEffect.bounds": (p)=>[
                            p.lat,
                            p.lng
                        ]
                }["MapBoundsFitter.useEffect.bounds"]));
                map.fitBounds(bounds, {
                    padding: [
                        50,
                        50
                    ],
                    maxZoom: 16
                });
            }
        }
    }["MapBoundsFitter.useEffect"], [
        map,
        properties
    ]);
    return null;
}
_s1(MapBoundsFitter, "IoceErwr5KVGS9kN4RQ1bOkYMAg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"]
    ];
});
_c1 = MapBoundsFitter;
function PropertyMap({ properties }) {
    _s2();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PropertyMap.useEffect": ()=>{
            fixLeafletIcons();
        }
    }["PropertyMap.useEffect"], []);
    // Default to Tokyo center
    const defaultCenter = [
        35.6762,
        139.6503
    ];
    const validProperties = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PropertyMap.useMemo[validProperties]": ()=>properties.filter({
                "PropertyMap.useMemo[validProperties]": (p)=>p.lat && p.lng
            }["PropertyMap.useMemo[validProperties]"])
    }["PropertyMap.useMemo[validProperties]"], [
        properties
    ]);
    if (validProperties.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-[500px] bg-gray-100 rounded-xl",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-4xl mb-2",
                        children: "🗺️"
                    }, void 0, false, {
                        fileName: "[project]/app/components/PropertyMap.tsx",
                        lineNumber: 242,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600",
                        children: "No properties with location data found"
                    }, void 0, false, {
                        fileName: "[project]/app/components/PropertyMap.tsx",
                        lineNumber: 243,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/PropertyMap.tsx",
                lineNumber: 241,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/PropertyMap.tsx",
            lineNumber: 240,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full h-[50vh] md:h-[600px] min-h-[300px] rounded-xl overflow-hidden shadow-lg border border-gray-200",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MapContainer"], {
            center: defaultCenter,
            zoom: 12,
            scrollWheelZoom: true,
            style: {
                height: '100%',
                width: '100%'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TileLayer"], {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }, void 0, false, {
                    fileName: "[project]/app/components/PropertyMap.tsx",
                    lineNumber: 257,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MarkerClusterGroup, {
                    properties: validProperties
                }, void 0, false, {
                    fileName: "[project]/app/components/PropertyMap.tsx",
                    lineNumber: 261,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapBoundsFitter, {
                    properties: validProperties
                }, void 0, false, {
                    fileName: "[project]/app/components/PropertyMap.tsx",
                    lineNumber: 262,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/PropertyMap.tsx",
            lineNumber: 251,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/PropertyMap.tsx",
        lineNumber: 250,
        columnNumber: 5
    }, this);
}
_s2(PropertyMap, "zmWA3MSjJgVGnmjZ60oLpMkxaAg=");
_c2 = PropertyMap;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "MarkerClusterGroup");
__turbopack_context__.k.register(_c1, "MapBoundsFitter");
__turbopack_context__.k.register(_c2, "PropertyMap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/PropertyMap.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/components/PropertyMap.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=app_components_PropertyMap_tsx_b513933d._.js.map