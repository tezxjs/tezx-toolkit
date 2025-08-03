import { GlobalConfig } from "tezx/helper";
import { html as htmlTab } from "./html/index.js";
export function DevTools(app, options = { disableTabs: [] }) {
    let { disableTabs, extraTabs } = options;
    return async (ctx) => {
        let extraTabs = await (typeof options.extraTabs === "function"
            ? options.extraTabs(ctx)
            : []);
        let html = [
            ...(disableTabs?.length
                ? htmlTab(ctx, app)?.filter((r) => !disableTabs?.includes(r?.tab))
                : htmlTab(ctx, app)),
            ...extraTabs,
        ];
        let tab = ctx.req.query?._tab || html?.[0]?.tab;
        const navbar = `
         <header>
            <div class="tabs">
                <svg style="height:32px;" viewBox="0 0 1168 1168" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 1168H571H1168V0H0V1168ZM875.727 438.273C889.595 422.44 898 401.702 898 379C898 329.294 857.706 289 808 289H394C353.27 289 318.859 316.056 307.76 353.176C306.497 356.537 305.743 360.007 305.323 363.538C304.453 368.562 304 373.728 304 379C304 391.196 306.426 402.826 310.822 413.433C312.665 418.546 315.069 423.475 318.196 428.148C330.741 446.897 347.077 459.078 366.816 464.822C375.393 467.536 384.525 469 394 469H463.948C483.783 469.859 502.288 485.944 504.766 505.706C505.397 510.741 507.296 511.065 511.279 511.053C550.605 510.932 589.931 510.935 629.257 510.968C630.811 510.969 632.364 511.217 634.118 511.496C635.002 511.637 635.937 511.786 636.949 511.916C626.868 528.482 614.204 542.312 601.838 555.818C596.597 561.541 591.41 567.207 586.495 572.997C594.303 572.997 602.117 572.997 609.933 572.997C625.577 572.997 641.234 572.998 656.891 572.997C664.604 572.997 670.16 577.563 674.003 586.41C676.939 593.168 673.204 597.465 669.012 601.673C665.523 605.176 661.997 608.643 658.471 612.11C652.374 618.105 646.276 624.101 640.372 630.28C623.174 648.281 606.087 666.387 589 684.493C583.127 690.717 577.254 696.94 571.376 703.159C569.096 705.571 566.817 707.983 564.537 710.395C546.142 729.856 527.747 749.318 509.448 768.869C508.123 770.285 507.122 772.611 507.086 774.535C507.02 778.048 506.95 781.562 506.88 785.076C506.515 803.374 506.15 821.676 506.327 839.972C506.565 864.654 514.717 886.476 532.273 904.257C554.282 926.547 581.133 935.806 612.155 932.956C632.013 931.131 649.792 923.622 664.684 910.492C688.018 889.92 698.995 863.578 698.976 832.521C698.967 817.133 698.951 801.745 698.934 786.357C698.879 734.918 698.824 683.479 699.058 632.041C699.239 592.242 700.038 552.442 700.935 512.65C701.394 492.268 712.853 472.037 736.661 469H752.068C767.139 469.637 782.276 469.326 797.391 469H808C822.467 469 836.137 465.587 848.248 459.521C853.897 456.773 859.336 453.351 864.545 449.168C868.518 445.978 872.273 442.319 875.727 438.273ZM604.236 618.923C577.696 649.321 551.156 679.719 524.615 710.117C514.372 721.778 504.167 733.401 493.987 744.995C467.191 775.513 440.574 805.828 413.913 836.104C408.346 842.426 402.631 848.618 396.917 854.81C394.508 857.421 392.099 860.031 389.701 862.651C389.525 862.844 389.351 863.045 389.177 863.247C388.573 863.945 387.961 864.654 387.198 865.066C386.075 865.673 384.859 866.109 383.644 866.545C383.131 866.729 382.619 866.912 382.113 867.109C382.229 866.551 382.302 865.969 382.375 865.386C382.53 864.141 382.686 862.896 383.26 861.89C399.678 833.115 416.134 804.362 432.589 775.609C444.082 755.528 455.575 735.447 467.055 715.358C473.703 703.725 480.221 692.018 486.739 680.312C487.702 678.583 488.665 676.853 489.628 675.124C490.128 674.226 490.473 673.242 490.902 672.017C491.13 671.364 491.383 670.643 491.695 669.831C489.284 669.736 486.953 669.626 484.675 669.519C479.86 669.292 475.284 669.077 470.707 669.035C464.041 668.974 457.374 668.957 450.706 668.94C438.882 668.909 427.057 668.879 415.238 668.602C412.068 668.528 408.628 666.615 405.896 664.713C402.705 662.492 401.956 659.008 404.394 655.535C405.752 653.6 407.106 651.663 408.46 649.725C413.569 642.416 418.678 635.106 423.984 627.943C431.997 617.124 440.069 606.349 448.14 595.573C455.492 585.758 462.843 575.943 470.151 566.096C472.996 562.262 476.024 560.165 481.228 560.248C495.624 560.48 510.025 560.443 524.427 560.406C530.349 560.391 536.272 560.376 542.194 560.379C542.821 560.38 543.448 560.477 544.082 560.575C544.38 560.621 544.679 560.667 544.98 560.704C531.162 579.325 517.53 597.696 503.898 616.067L504.921 617.585H603.574C603.686 617.812 603.798 618.038 603.91 618.265C604.019 618.484 604.127 618.704 604.236 618.923Z" fill="#FF581E"/>
                </svg>
                 ${html?.map((r) => `<a href = "?_tab=${r?.tab}" class="${tab === r?.tab ? "active" : ""}" > ${r?.label} </a>`)?.join("\n")}
            </div>
            <div class="tabs">
                <a class="toggle-dark" onclick="toggleTheme()">🌙 Toggle Dark</a>
                <a class="active">
                  ${GlobalConfig.adapter}
                </a>
            </div>
        </header>
        `;
        let find = html.find((r) => r?.tab == tab);
        return ctx.html `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${find?.doc_title}</title>
        <style>
            :root {
                --bg: #f8f9fa;
                --text: #212529;
                --accent: #FF581E;
                --header-bg: rgba(255, 255, 255, 0.94);
                --table-bg: #ffffff;
                --table-border: #d1d5db;
                /* Gray-300 */
                --tr-hover: #e3f2fd;
                /* Light Blue Hover */
                --tr-odd: #f8fafc;
                /* Lightest gray-blue */
                --tr-even: #ffffff;
            }

            body.dark {
                --bg: #0e1117;
                --text: #f1f3f5;
                --accent: #58a6ff;
                /* GitHub Blue */
                --header-bg: rgba(18, 18, 18, 0.9);
                --table-bg: #161b22;
                --table-border: #30363d;
                --tr-hover: #1f6feb33;
                /* Blue hover with opacity */
                --tr-odd: #1a1f24;
                --tr-even: #0f1419;

                --col-1: #9ca3af;
                /* Gray-400 */
                --col-2: #58a6ff;
                /* Blue-300 */
                --col-3: #4ade80;
                /* Green-400 */
                --col-4: #facc15;
                /* Yellow-400 */
                --col-5: #c084fc;
                /* Purple-400 */
            }

            body {
                margin: 0;
                font-family: system-ui, sans-serif;
                background: var(--bg);
                color: var(--text);
                transition: background 0.3s ease, color 0.3s ease;
            }


            header {
                position: sticky;
                background: var(--header-bg);
                border-bottom: 1px solid var(--accent);
                top: 0px;
                display: flex;
                padding: 16px;
                align-items: center;
                justify-content: space-between;
                gap: 6px;
                flex-wrap: wrap;
            }

            header>div {
                display: flex;
                gap: 6px;
                align-items: center;
            }
            .toolbar ,.action{
                display: flex;
                padding: 16px;
                align-items: center;
                gap: 6px;
                flex-wrap: wrap;
            }
            .tabs a {
                padding: 0.4rem 0.8rem;
                text-decoration: none;
                border: 1px solid var(--accent);
                border-radius: 5px;
                color: var(--accent);
                cursor: pointer;
                text-transform: capitalize;
            }

            .tabs a.active {
                background-color: var(--accent);
                color: white;
                cursor: default;
            }

            .tabs a.counting::after {
                content: attr(data-count);
                background: var(--accent);
                color: white;
                font-size: 0.7rem;
                margin-left: 6px;
                padding: 2px 6px;
                border-radius: 10px;
                display: inline-block;
            }

            .tabs a.counting.active::after {
                content: attr(data-count);
                background: white;
                color: black;
                font-size: 0.7rem;
                margin-left: 6px;
                padding: 2px 6px;
                border-radius: 10px;
                display: inline-block;
            }

            section.content {
                padding: 16px;
            }

            h1 {
                font-size: 1.8rem;
                margin-top: 0px;
                margin-bottom: 20px;
            }

            input[type="text"] {
                display: inline-flex;
                margin-top: 16px;
                padding: 0.5rem;
                font-size: 1rem;
                border: 1px solid var(--table-border);
                border-radius: 6px;
                max-width: 300px;
            }

            input[type="text"]:focus {
                outline: 1px solid var(--accent);
            }

            .match-true {
                color: green;
                font-weight: bold;
            }

            .match-false {
                color: red;
                font-weight: bold;
            }

            .json-view {
                margin-top: 16px;
                white-space: pre-wrap;
                background: var(--table-bg);
                padding: 1rem;
                border: 1px solid var(--table-border);
                border-radius: 6px;
                font-family: monospace;
                max-height: 600px;
                overflow: auto;
            }
            pre#json-output {
                margin-top: 1rem;
                padding: 1rem;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                overflow-x: auto;
                display: none;
                background: #f3f4f6;
            }
            .table-container {
                overflow: auto;
                margin-top: 16px;
                border-radius: 0.5rem;
                height: 75vh;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }

            table {
                width: 100%;
                border-collapse: collapse;
                background: var(--table-bg);
                margin-top: 1rem;
                border: 1px solid var(--table-border);
            }
            .copy-btn:hover {
                 background: #e2e8f0;
            }
            .copy-btn {
                background: #f8fafc;
                border: none;
                padding: 0.3rem 0.4rem;
                border-radius: 0.375rem;
                cursor: pointer;
                color: #334155;
                transition: background 0.2s ease;
            }

            .delete-btn:hover {
                background: #b91c1c;
            }
            .delete-btn {
                background: #dc2626;
                border: none;
                padding: 0.3rem 0.4rem;
                border-radius: 0.375rem;
                cursor: pointer;
                color: white;
                transition: background 0.2s ease;
            }
            th,
            td {
                padding: 0.75rem;
                text-align: left;
                border: 1px solid var(--table-border);
                font-size: 0.95rem;
            }

            thead {
                background-color: var(--accent);
                color: white;
                position: sticky;
                top: 0px;
            }

            /* Light mode zebra striping */
            tbody tr:nth-child(odd) {
                background-color: var(--tr-odd);
            }

            tbody tr:nth-child(even) {
                background-color: var(--tr-even);
            }

            /* Hover effect */
            tbody tr:hover {
                background-color: var(--tr-hover);
            }

            .status-true {
                color: green;
                font-weight: bold;
            }

            .status-false {
                color: red;
                font-weight: bold;
            }

            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #323232;
                color: white;
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 0.875rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                z-index: 9999;
                animation: fadeInOut 3s ease forwards;
            }

            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(10px); }
                10% { opacity: 1; transform: translateY(0); }
                90% { opacity: 1; }
                100% { opacity: 0; transform: translateY(10px); }
            }
            /**
            @media (max-width: 768px) {
                table,
                thead,
                tbody,
                th,
                td,
                tr {
                    display: block;
                }

                thead {
                    display: none;
                }

                tr {
                    margin-bottom: 1rem;
                    border: 1px solid var(--table-border);
                    border-radius: 8px;
                    background: var(--table-bg);
                }

                td {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 1rem;
                    border: none;
                }

                td::before {
                    content: attr(data-label);
                    font-weight: bold;
                    color: var(--accent);
                }
            }
        **/

        
        </style>
    </head>
    <body>
        ${navbar}

        <section class="content">
            <h1>
                ${find?.doc_title}
            </h1>
            ${find?.content}
        </section>
                <script>

                    function showToast(msg) {
                        const toast = document.createElement('div');
                        toast.className = 'toast';
                        toast.textContent = msg;
                        document.body.appendChild(toast);
                        setTimeout(() => toast.remove(), 3000);
                    }
                    const themeCookieName = "tezx-theme";

                    function setCookie(name, value, days = 30) {
                        const expires = new Date(Date.now() + days * 864e5).toUTCString();
                        document.cookie = name +"="+ value +"; expires = "+ expires +"; path =/";
                    }
                    function getCookie(name) {
                        return document.cookie.split('; ').reduce((acc, cookie) => {
                            const [key, val] = cookie.split('=');
                            return key === name ? decodeURIComponent(val) : acc;
                        }, null);
                    }

                    function toggleTheme() {
                        document.body.classList.toggle('dark');
                        setCookie(themeCookieName, document.body.classList.contains('dark') ? 'dark' : 'light');
                    }

                    // Load theme from cookie
                    window.addEventListener('DOMContentLoaded', () => {
                        const savedTheme = getCookie(themeCookieName);
                        if (savedTheme === 'dark') {
                            document.body.classList.add('dark');
                        }
                    });
                </script>
    </body>
</html>
  `;
    };
}
export default DevTools;
