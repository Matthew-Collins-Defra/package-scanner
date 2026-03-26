#!/usr/bin/env node
import fs from "fs";
import path from "path";
// Import parsers
let yarnLockfile, yarnParsers, jsYaml;
try { yarnLockfile = await import("@yarnpkg/lockfile"); } catch { }
try { yarnParsers = await import("@yarnpkg/parsers"); } catch { }
try { jsYaml = await import("js-yaml"); } catch { }
// Vulnerable packages we're checking
const TARGETS = [
  { name: "@ctrl/deluge", version: new Set(["7.2.2", "7.2.1"]) },
  { name: "@ctrl/golang-template", version: new Set(["1.4.3", "1.4.2"]) },
  { name: "@ctrl/magnet-link", version: new Set(["4.0.4", "4.0.3"]) },
  { name: "@ctrl/ngx-codemirror", version: new Set(["7.0.2", "7.0.1"]) },
  { name: "@ctrl/ngx-csv", version: new Set(["6.0.2", "6.0.1"]) },
  { name: "@ctrl/ngx-emoji-mart", version: new Set(["9.2.2", "9.2.1"]) },
  { name: "@ctrl/ngx-rightclick", version: new Set(["4.0.2", "4.0.1"]) },
  { name: "@ctrl/qbittorrent", version: new Set(["9.7.2", "9.7.1"]) },
  { name: "@ctrl/react-adsense", version: new Set(["2.0.2", "2.0.1"]) },
  { name: "@ctrl/shared-torrent", version: new Set(["6.3.2", "6.3.1"]) },
  { name: "@ctrl/tinycolor@4.1.1", version: new Set(["4.1.2"]) },
  { name: "@ctrl/torrent-file", version: new Set(["4.1.2", "4.1.1"]) },
  { name: "@ctrl/transmission", version: new Set(["7.3.1"]) },
  { name: "@ctrl/ts-base32", version: new Set(["4.0.2", "4.0.1"]) },
  { name: "@nativescript-community/gesturehandler", version: new Set(["2.0.35"]) },
  { name: "@nativescript-community/sentry", version: new Set(["4.6.43"]) },
  { name: "@nativescript-community/text", version: new Set(["1.6.13", "1.6.10", "1.6.11", "1.6.12", "1.6.9"]) },
  { name: "@nativescript-community/ui-collectionview", version: new Set(["6.0.6"]) },
  { name: "@nativescript-community/ui-drawer", version: new Set(["0.1.30"]) },
  { name: "@nativescript-community/ui-image", version: new Set(["4.5.6"]) },
  { name: "@nativescript-community/ui-material-bottomsheet", version: new Set(["7.2.72"]) },
  { name: "@nativescript-community/ui-material-core", version: new Set(["7.2.76", "7.2.72", "7.2.73", "7.2.74", "7.2.75"]) },
  { name: "@nativescript-community/ui-material-core-tabs", version: new Set(["7.2.76", "7.2.72", "7.2.73", "7.2.74", "7.2.75"]) },
  { name: "@teselagen/bio-parsers", version: new Set(["0.4.29", "0.4.30"]) },
  { name: "@teselagen/bounce-loader", version: new Set(["0.3.16", "0.3.17"]) },
  { name: "@teselagen/file-utils", version: new Set(["0.3.21", "0.3.22"]) },
  { name: "@teselagen/liquibase-tools", version: new Set(["0.4.1"]) },
  { name: "@teselagen/ove", version: new Set(["0.7.39", "0.7.40"]) },
  { name: "@teselagen/range-utils", version: new Set(["0.3.14", "0.3.15"]) },
  { name: "@teselagen/react-list", version: new Set(["0.8.19", "0.8.20"]) },
  { name: "@teselagen/react-table", version: new Set(["6.10.21", "6.10.19", "6.10.20", "6.10.22"]) },
  { name: "@teselagen/sequence-utils", version: new Set(["0.3.33", "0.3.34"]) },
  { name: "@teselagen/ui", version: new Set(["0.9.9", "0.9.10"]) },
  { name: "angulartics2", version: new Set(["14.1.2", "14.1.1"]) },
  { name: "encounter-playground", version: new Set(["0.0.4", "0.0.5", "0.0.2", "0.0.3"]) },
  { name: "eslint-config-teselagen", version: new Set(["6.1.7", "6.1.8"]) },
  { name: "graphql-sequelize-teselagen", version: new Set(["5.3.8", "5.3.9"]) },
  { name: "json-rules-engine-simplified", version: new Set(["0.2.3", "0.2.4", "0.2.1"]) },
  { name: "koa2-swagger-ui", version: new Set(["5.11.2", "5.11.1"]) },
  { name: "ng2-file-upload", version: new Set(["8.0.3", "7.0.2", "7.0.3", "8.0.1", "8.0.2", "9.0.1"]) },
  { name: "ngx-bootstrap", version: new Set(["18.1.4", "19.0.3", "20.0.4", "20.0.5", "20.0.6", "19.0.4", "20.0.3"]) },
  { name: "ngx-color", version: new Set(["10.0.2", "10.0.1"]) },
  { name: "ngx-toastr", version: new Set(["19.0.2", "19.0.1"]) },
  { name: "ngx-trend", version: new Set(["8.0.1"]) },
  { name: "oradm-to-gql", version: new Set(["35.0.14", "35.0.15"]) },
  { name: "oradm-to-sqlz", version: new Set(["1.1.4", "1.1.2"]) },
  { name: "ove-auto-annotate", version: new Set(["0.0.9", "0.0.10"]) },
  { name: "react-complaint-image", version: new Set(["0.0.34", "0.0.35", "0.0.32"]) },
  { name: "react-jsonschema-form-conditionals", version: new Set(["0.3.20", "0.3.21", "0.3.18"]) },
  { name: "react-jsonschema-form-extras", version: new Set(["1.0.3", "1.0.4"]) },
  { name: "react-jsonschema-rxnt-extras", version: new Set(["0.4.8", "0.4.9"]) },
  { name: "rxnt-authentication", version: new Set(["0.0.5", "0.0.6", "0.0.3", "0.0.4"]) },
  { name: "rxnt-healthchecks-nestjs", version: new Set(["1.0.4", "1.0.5", "1.0.2", "1.0.3"]) },
  { name: "rxnt-kue", version: new Set(["1.0.6", "1.0.7", "1.0.4", "1.0.5"]) },
  { name: "swc-plugin-component-annotate", version: new Set(["1.9.2", "1.9.1"]) },
  { name: "tg-client-query-builder", version: new Set(["2.14.4", "2.14.5"]) },
  { name: "tg-redbird", version: new Set(["1.3.1", "1.3.2"]) },
  { name: "tg-seq-gen", version: new Set(["1.0.9", "1.0.10"]) },
  { name: "ts-gaussian", version: new Set(["3.0.6", "3.0.5"]) },
  { name: "ve-bamreader", version: new Set(["0.2.6", "0.2.7"]) },
  { name: "ve-editor", version: new Set(["1.0.1", "1.0.2"]) },
  { name: "@ahmedhfarag/ngx-perfect-scrollbar", version: new Set(["20.0.20"]) },
  { name: "@ahmedhfarag/ngx-virtual-scroller", version: new Set(["4.0.4"]) },
  { name: "@art-ws/common", version: new Set(["2.0.28"]) },
  { name: "@art-ws/config-eslint", version: new Set(["2.0.4", "2.0.5"]) },
  { name: "@art-ws/config-ts", version: new Set(["2.0.7", "2.0.8"]) },
  { name: "@art-ws/db-context", version: new Set(["2.0.24"]) },
  { name: "@art-ws/di-node", version: new Set(["2.0.13"]) },
  { name: "@art-ws/di", version: new Set(["2.0.28", "2.0.32"]) },
  { name: "@art-ws/eslint", version: new Set(["1.0.5", "1.0.6"]) },
  { name: "@art-ws/fastify-http-server", version: new Set(["2.0.24", "2.0.27"]) },
  { name: "@art-ws/http-server", version: new Set(["2.0.21", "2.0.25"]) },
  { name: "@art-ws/openapi", version: new Set(["0.1.12", "0.1.9"]) },
  { name: "@art-ws/package-base", version: new Set(["1.0.5", "1.0.6"]) },
  { name: "@art-ws/prettier", version: new Set(["1.0.5", "1.0.6"]) },
  { name: "@art-ws/slf", version: new Set(["2.0.15", "2.0.22"]) },
  { name: "@art-ws/ssl-info", version: new Set(["1.0.10", "1.0.9"]) },
  { name: "@art-ws/web-app", version: new Set(["1.0.3", "1.0.4"]) },
  { name: "@crowdstrike/commitlint", version: new Set(["8.1.1", "8.1.2"]) },
  { name: "@crowdstrike/falcon-shoelace", version: new Set(["0.4.1", "0.4.2"]) },
  { name: "@crowdstrike/foundry-js", version: new Set(["0.19.1", "0.19.2"]) },
  { name: "@crowdstrike/glide-core", version: new Set(["0.34.2", "0.34.3"]) },
  { name: "@crowdstrike/logscale-dashboard", version: new Set(["1.205.1", "1.205.2"]) },
  { name: "@crowdstrike/logscale-file-editor", version: new Set(["1.205.1", "1.205.2"]) },
  { name: "@crowdstrike/logscale-parser-edit", version: new Set(["1.205.1", "1.205.2"]) },
  { name: "@crowdstrike/logscale-search", version: new Set(["1.205.1", "1.205.2"]) },
  { name: "@crowdstrike/tailwind-toucan-base", version: new Set(["5.0.1", "5.0.2"]) },
  { name: "@ctrl/tinycolor", version: new Set(["4.1.1", "4.1.2"]) },
  { name: "@hestjs/core", version: new Set(["0.2.1"]) },
  { name: "@hestjs/cqrs", version: new Set(["0.1.6"]) },
  { name: "@hestjs/demo", version: new Set(["0.1.2"]) },
  { name: "@hestjs/eslint-config", version: new Set(["0.1.2"]) },
  { name: "@hestjs/logger", version: new Set(["0.1.6"]) },
  { name: "@hestjs/scalar", version: new Set(["0.1.7"]) },
  { name: "@hestjs/validation", version: new Set(["0.1.6"]) },
  { name: "@nativescript-community/arraybuffers", version: new Set(["1.1.6", "1.1.7", "1.1.8"]) },
  { name: "@nativescript-community/perms", version: new Set(["3.0.5", "3.0.6", "3.0.7", "3.0.8", "3.0.9"]) },
  { name: "@nativescript-community/sqlite", version: new Set(["3.5.2", "3.5.3", "3.5.4", "3.5.5"]) },
  { name: "@nativescript-community/typeorm", version: new Set(["0.2.30", "0.2.31", "0.2.32", "0.2.33"]) },
  { name: "@nativescript-community/ui-document-picker", version: new Set(["1.1.27", "1.1.28", "13.0.32"]) },
  { name: "@nativescript-community/ui-label", version: new Set(["1.3.35", "1.3.36", "1.3.37"]) },
  { name: "@nativescript-community/ui-material-bottom-navigation", version: new Set(["7.2.72", "7.2.73", "7.2.74", "7.2.75"]) },
  { name: "@nativescript-community/ui-material-ripple", version: new Set(["7.2.72", "7.2.73", "7.2.74", "7.2.75"]) },
  { name: "@nativescript-community/ui-material-tabs", version: new Set(["7.2.72", "7.2.73", "7.2.74", "7.2.75"]) },
  { name: "@nativescript-community/ui-pager", version: new Set(["14.1.36", "14.1.37", "14.1.38"]) },
  { name: "@nativescript-community/ui-pulltorefresh", version: new Set(["2.5.4", "2.5.5", "2.5.6", "2.5.7"]) },
  { name: "@nexe/config-manager", version: new Set(["0.1.1"]) },
  { name: "@nexe/eslint-config", version: new Set(["0.1.1"]) },
  { name: "@nexe/logger", version: new Set(["0.1.3"]) },
  { name: "@nstudio/angular", version: new Set(["20.0.4", "20.0.5", "20.0.6"]) },
  { name: "@nstudio/focus", version: new Set(["20.0.4", "20.0.5", "20.0.6"]) },
  { name: "@nstudio/nativescript-checkbox", version: new Set(["2.0.6", "2.0.7", "2.0.8", "2.0.9"]) },
  { name: "@nstudio/nativescript-loading-indicator", version: new Set(["5.0.1", "5.0.2", "5.0.3", "5.0.4"]) },
  { name: "@nstudio/ui-collectionview", version: new Set(["5.1.11", "5.1.12", "5.1.13", "5.1.14"]) },
  { name: "@nstudio/web-angular", version: new Set(["20.0.4"]) },
  { name: "@nstudio/web", version: new Set(["20.0.4"]) },
  { name: "@nstudio/xplat-utils", version: new Set(["20.0.5", "20.0.6", "20.0.7"]) },
  { name: "@nstudio/xplat", version: new Set(["20.0.5", "20.0.6", "20.0.7"]) },
  { name: "@operato/board", version: new Set(["9.0.36", "9.0.37", "9.0.38", "9.0.39", "9.0.40", "9.0.41", "9.0.42", "9.0.43", "9.0.44", "9.0.45", "9.0.46"]) },
  { name: "@operato/data-grist", version: new Set(["9.0.29", "9.0.35", "9.0.36", "9.0.37"]) },
  { name: "@operato/graphql", version: new Set(["9.0.22", "9.0.35", "9.0.36", "9.0.37", "9.0.38", "9.0.39", "9.0.40", "9.0.41", "9.0.42", "9.0.43", "9.0.44", "9.0.45", "9.0.46"]) },
  { name: "@operato/headroom", version: new Set(["9.0.2", "9.0.35", "9.0.36", "9.0.37"]) },
  { name: "@operato/help", version: new Set(["9.0.35", "9.0.36", "9.0.37", "9.0.38", "9.0.39", "9.0.40", "9.0.41", "9.0.42", "9.0.43", "9.0.44", "9.0.45", "9.0.46"]) },
  { name: "@operato/i18n", version: new Set(["9.0.35", "9.0.36", "9.0.37"]) },
  { name: "@operato/input", version: new Set(["9.0.27", "9.0.35", "9.0.36", "9.0.37", "9.0.38", "9.0.39", "9.0.40", "9.0.41", "9.0.42", "9.0.43", "9.0.44", "9.0.45", "9.0.46", "9.0.47", "9.0.48"]) },
  { name: "@operato/layout", version: new Set(["9.0.35", "9.0.36", "9.0.37"]) },
  { name: "@operato/popup", version: new Set(["9.0.22", "9.0.35", "9.0.36", "9.0.37", "9.0.38", "9.0.39", "9.0.40", "9.0.41", "9.0.42", "9.0.43", "9.0.44", "9.0.45", "9.0.46", "9.0.49"]) },
  { name: "@operato/pull-to-refresh", version: new Set(["9.0.36", "9.0.37", "9.0.38", "9.0.39", "9.0.40", "9.0.41", "9.0.42"]) },
  { name: "@operato/shell", version: new Set(["9.0.22", "9.0.35", "9.0.36", "9.0.37", "9.0.38", "9.0.39"]) },
  { name: "@operato/styles", version: new Set(["9.0.2", "9.0.35", "9.0.36", "9.0.37"]) },
  { name: "@operato/utils", version: new Set(["9.0.22", "9.0.35", "9.0.36", "9.0.37", "9.0.38", "9.0.39", "9.0.40", "9.0.41", "9.0.42", "9.0.43", "9.0.44", "9.0.45", "9.0.46", "9.0.49"]) },
  { name: "@thangved/callback-window", version: new Set(["1.1.4"]) },
  { name: "@things-factory/attachment-base", version: new Set(["9.0.42", "9.0.43", "9.0.44", "9.0.45", "9.0.46", "9.0.47", "9.0.48", "9.0.49", "9.0.50", "9.0.51", "9.0.52", "9.0.53", "9.0.54", "9.0.55"]) },
  { name: "@things-factory/auth-base", version: new Set(["9.0.42", "9.0.43", "9.0.44", "9.0.45"]) },
  { name: "@things-factory/email-base", version: new Set(["9.0.42", "9.0.43", "9.0.44", "9.0.45", "9.0.46", "9.0.47", "9.0.48", "9.0.49", "9.0.50", "9.0.51", "9.0.52", "9.0.53", "9.0.54", "9.0.55", "9.0.56", "9.0.57", "9.0.58", "9.0.59"]) },
  { name: "@things-factory/env", version: new Set(["9.0.42", "9.0.43", "9.0.44", "9.0.45"]) },
  { name: "@things-factory/integration-base", version: new Set(["9.0.42", "9.0.43", "9.0.44", "9.0.45"]) },
  { name: "@things-factory/integration-marketplace", version: new Set(["9.0.42", "9.0.43", "9.0.44", "9.0.45"]) },
  { name: "@things-factory/shell", version: new Set(["9.0.42", "9.0.43", "9.0.44", "9.0.45"]) },
  { name: "@tnf-dev/api", version: new Set(["1.0.8"]) },
  { name: "@tnf-dev/core", version: new Set(["1.0.8"]) },
  { name: "@tnf-dev/js", version: new Set(["1.0.8"]) },
  { name: "@tnf-dev/mui", version: new Set(["1.0.8"]) },
  { name: "@tnf-dev/react", version: new Set(["1.0.8"]) },
  { name: "@ui-ux-gang/devextreme-angular-rpk", version: new Set(["24.1.7"]) },
  { name: "@yoobic/design-system", version: new Set(["6.5.17"]) },
  { name: "@yoobic/jpeg-camera-es6", version: new Set(["1.0.13"]) },
  { name: "@yoobic/yobi", version: new Set(["8.7.53"]) },
  { name: "airchief", version: new Set(["0.3.1"]) },
  { name: "airpilot", version: new Set(["0.8.8"]) },
  { name: "browser-webdriver-downloader", version: new Set(["3.0.8"]) },
  { name: "capacitor-notificationhandler", version: new Set(["0.0.2", "0.0.3"]) },
  { name: "capacitor-plugin-healthapp", version: new Set(["0.0.2", "0.0.3"]) },
  { name: "capacitor-plugin-ihealth", version: new Set(["1.1.8", "1.1.9"]) },
  { name: "capacitor-plugin-vonage", version: new Set(["1.0.2", "1.0.3"]) },
  { name: "capacitorandroidpermissions", version: new Set(["0.0.4", "0.0.5"]) },
  { name: "config-cordova", version: new Set(["0.8.5"]) },
  { name: "cordova-plugin-voxeet2", version: new Set(["1.0.24"]) },
  { name: "cordova-voxeet", version: new Set(["1.0.32"]) },
  { name: "create-hest-app", version: new Set(["0.1.9"]) },
  { name: "db-evo", version: new Set(["1.1.4", "1.1.5"]) },
  { name: "devextreme-angular-rpk", version: new Set(["21.2.8"]) },
  { name: "ember-browser-services", version: new Set(["5.0.2", "5.0.3"]) },
  { name: "ember-headless-form-yup", version: new Set(["1.0.1"]) },
  { name: "ember-headless-form", version: new Set(["1.1.2", "1.1.3"]) },
  { name: "ember-headless-table", version: new Set(["2.1.5", "2.1.6"]) },
  { name: "ember-url-hash-polyfill", version: new Set(["1.0.12", "1.0.13"]) },
  { name: "ember-velcro", version: new Set(["2.2.1", "2.2.2"]) },
  { name: "eslint-config-crowdstrike-node", version: new Set(["4.0.3", "4.0.4"]) },
  { name: "eslint-config-crowdstrike", version: new Set(["11.0.2", "11.0.3"]) },
  { name: "globalize-rpk", version: new Set(["1.7.4"]) },
  { name: "html-to-base64-image", version: new Set(["1.0.2"]) },
  { name: "jumpgate", version: new Set(["0.0.2"]) },
  { name: "mcfly-semantic-release", version: new Set(["1.3.1"]) },
  { name: "mcp-knowledge-base", version: new Set(["0.0.2"]) },
  { name: "mcp-knowledge-graph", version: new Set(["1.2.1"]) },
  { name: "mobioffice-cli", version: new Set(["1.0.3"]) },
  { name: "monorepo-next", version: new Set(["13.0.1", "13.0.2"]) },
  { name: "mstate-angular", version: new Set(["0.4.4"]) },
  { name: "mstate-cli", version: new Set(["0.4.7"]) },
  { name: "mstate-dev-react", version: new Set(["1.1.1"]) },
  { name: "mstate-react", version: new Set(["1.6.5"]) },
  { name: "ngx-ws", version: new Set(["1.1.5", "1.1.6"]) },
  { name: "pm2-gelf-json", version: new Set(["1.0.4", "1.0.5"]) },
  { name: "printjs-rpk", version: new Set(["1.6.1"]) },
  { name: "remark-preset-lint-crowdstrike", version: new Set(["4.0.1", "4.0.2"]) },
  { name: "tbssnch", version: new Set(["1.0.2"]) },
  { name: "teselagen-interval-tree", version: new Set(["1.1.2"]) },
  { name: "thangved-react-grid", version: new Set(["1.0.3"]) },
  { name: "ts-imports", version: new Set(["1.0.1", "1.0.2"]) },
  { name: "tvi-cli", version: new Set(["0.1.5"]) },
  { name: "verror-extra", version: new Set(["6.0.1"]) },
  { name: "voip-callkit", version: new Set(["1.0.2", "1.0.3"]) },
  { name: "wdio-web-reporter", version: new Set(["0.1.3"]) },
  { name: "yargs-help-output", version: new Set(["5.0.3"]) },
  { name: "yoo-styles", version: new Set(["6.0.326"]) },
  { name: "backslash", version: new Set(["0.2.1"]) },
  { name: "chalk-template", version: new Set(["1.1.1"]) },
  { name: "supports-hyperlinks", version: new Set(["4.1.1"]) },
  { name: "has-ansi", version: new Set(["6.0.1"]) },
  { name: "simple-swizzle", version: new Set(["0.2.3"]) },
  { name: "color-string", version: new Set(["2.1.1"]) },
  { name: "error-ex", version: new Set(["1.3.3"]) },
  { name: "color-name", version: new Set(["2.0.1"]) },
  { name: "is-arrayish", version: new Set(["0.3.3"]) },
  { name: "slice-ansi", version: new Set(["7.1.1"]) },
  { name: "color-convert", version: new Set(["3.1.1"]) },
  { name: "wrap-ansi", version: new Set(["9.0.1"]) },
  { name: "ansi-regex", version: new Set(["6.2.1"]) },
  { name: "supports-color", version: new Set(["10.2.1"]) },
  { name: "strip-ansi", version: new Set(["7.1.1"]) },
  { name: "chalk", version: new Set(["5.6.1"]) },
  { name: "debug", version: new Set(["4.4.2"]) },
  { name: "ansi-styles", version: new Set(["6.2.2"]) },
  { name: "@leafnoise/mirage", version: new Set(["2.0.3"]) },
  { name: "jest-preset-ppf", version: new Set(["0.0.2"]) },
  { name: "babel-plugin-react-pure-component", version: new Set(["0.1.6"]) },
  { name: "eslint-config-service-users", version: new Set(["0.0.3"]) },
  { name: "opengov-k6-core", version: new Set(["1.0.2"]) },
  { name: "cit-playwright-tests", version: new Set(["1.0.1"]) },
  { name: "react-leaflet-marker-layer", version: new Set(["0.1.5"]) },
  { name: "react-leaflet-cluster-layer", version: new Set(["0.0.4"]) },
  { name: "eslint-config-ppf", version: new Set(["0.128.2"]) },
  { name: "@opengov/form-renderer", version: new Set(["0.2.20"]) },
  { name: "@opengov/qa-record-types-api", version: new Set(["1.0.3"]) },
  { name: "@airtm/uuid-base32", version: new Set(["1.0.2"]) },
  { name: "@opengov/form-builder", version: new Set(["0.12.3"]) },
  { name: "@emilgroup/document-uploader", version: new Set(["0.0.12"]) },
  { name: "@emilgroup/task-sdk-node", version: new Set(["1.0.4"]) },
  { name: "@emilgroup/discount-sdk", version: new Set(["1.5.3"]) },
  { name: "@emilgroup/accounting-sdk", version: new Set(["1.27.3"]) },
  { name: "@emilgroup/docxtemplater-util", version: new Set(["1.1.4"]) },
  { name: "@emilgroup/discount-sdk-node", version: new Set(["1.5.2"]) },
  { name: "@emilgroup/gdv-sdk-node", version: new Set(["2.6.3"]) },
  { name: "@emilgroup/setting-sdk", version: new Set(["0.2.3"]) },
  { name: "@emilgroup/changelog-sdk-node", version: new Set(["1.0.3"]) },
  { name: "@emilgroup/partner-portal-sdk", version: new Set(["1.1.3"]) },
  { name: "@emilgroup/process-manager-sdk", version: new Set(["1.4.2"]) },
  { name: "@emilgroup/numbergenerator-sdk-node", version: new Set(["1.3.3"]) },
  { name: "@emilgroup/task-sdk", version: new Set(["1.0.4"]) },
  { name: "@emilgroup/customer-sdk", version: new Set(["1.54.5"]) },
  { name: "@emilgroup/commission-sdk-node", version: new Set(["1.0.3"]) },
  { name: "@emilgroup/partner-sdk", version: new Set(["1.19.3"]) },
  { name: "@emilgroup/commission-sdk", version: new Set(["1.0.3"]) },
  { name: "@teale.io/eslint-config", version: new Set(["1.8.15"]) },
  { name: "@emilgroup/document-sdk-node", version: new Set(["1.43.5"]) },
  { name: "@emilgroup/partner-sdk-node", version: new Set(["1.19.2"]) },
  { name: "@emilgroup/billing-sdk", version: new Set(["1.56.2"]) },
  { name: "@emilgroup/insurance-sdk", version: new Set(["1.97.2"]) },
  { name: "@emilgroup/auth-sdk", version: new Set(["1.25.2"]) },
  { name: "@emilgroup/payment-sdk", version: new Set(["1.15.2"]) },
  { name: "@emilgroup/customer-sdk-node", version: new Set(["1.55.2"]) },
  { name: "@emilgroup/accounting-sdk-node", version: new Set(["1.26.2"]) },
  { name: "@emilgroup/tenant-sdk", version: new Set(["1.34.2"]) },
  { name: "@emilgroup/notification-sdk-node", version: new Set(["1.4.2"]) },
  { name: "@emilgroup/tenant-sdk-node", version: new Set(["1.33.2"]) },
  { name: "@emilgroup/document-sdk", version: new Set(["1.45.2"]) },
  { name: "@emilgroup/payment-sdk-node", version: new Set(["1.23.2"]) },
  { name: "@emilgroup/public-api-sdk", version: new Set(["1.33.2"]) },
  { name: "@emilgroup/auth-sdk-node", version: new Set(["1.21.2"]) },
  { name: "@emilgroup/account-sdk-node", version: new Set(["1.40.2"]) },
  { name: "@emilgroup/process-manager-sdk-node", version: new Set(["1.13.2"]) },
  { name: "@emilgroup/public-api-sdk-node", version: new Set(["1.35.2"]) },
  { name: "@emilgroup/partner-portal-sdk-node", version: new Set(["1.1.2"]) },
  { name: "@emilgroup/translation-sdk-node", version: new Set(["1.1.2"]) },
  { name: "@emilgroup/gdv-sdk", version: new Set(["2.6.2"]) },
  { name: "@emilgroup/account-sdk", version: new Set(["1.41.2"]) },
  { name: "@emilgroup/claim-sdk-node", version: new Set(["1.39.2"]) },
  { name: "@emilgroup/api-documentation", version: new Set(["1.19.2"]) },
  { name: "@emilgroup/billing-sdk-node", version: new Set(["1.57.2"]) },
  { name: "@emilgroup/insurance-sdk-node", version: new Set(["1.95.2"]) },
  { name: "react-autolink-text", version: new Set(["2.0.1"]) },
  { name: "@opengov/ppf-backend-types", version: new Set(["1.141.2"]) },
  { name: "react-leaflet-heatmap-layer", version: new Set(["2.0.1"]) },
  { name: "@opengov/form-utils", version: new Set(["0.7.2"]) },
  { name: "@opengov/ppf-eslint-config", version: new Set(["0.1.11"]) }

]
const repo = process.env.REPO || "";
const branch = process.env.BRANCH || "";
const dir = process.argv[2] || ".";
// Find all versions of our target packages
const found = new Map();
function recordPackage(name, version) {
  if (!found.has(name)) found.set(name, new Set());
  found.get(name).add(version);
}
// Parse npm package-lock.json
function scanNpmLock(file) {
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (data.packages) {
      for (const [key, pkg] of Object.entries(data.packages)) {
        if (key) {
          const names = key.split('/')
          pkg.name = names[names.length - 1]
          if (names.length > 1) {
            if (names[names.length - 2].startsWith('@')) {
              pkg.name = names[names.length - 2] + '/' + pkg.name
            }
          }
        }
        if (pkg.name && pkg.version) {
          recordPackage(pkg.name, pkg.version);
        }
      }
    }
  } catch { }
}
// Parse yarn.lock
function scanYarnLock(file) {
  try {
    const text = fs.readFileSync(file, "utf8");
    let parsed;

    if (yarnLockfile?.parse) {
      const result = yarnLockfile.parse(text);
      if (result?.object) parsed = result.object;
    }

    if (parsed) {
      for (const [selector, info] of Object.entries(parsed)) {
        if (info?.version) {
          const match = selector.match(/^(@?[^@]+)@/);
          if (match) recordPackage(match[1], info.version);
        }
      }
    }
  } catch { }
}
// Parse pnpm-lock.yaml
function scanPnpmLock(file) {
  try {
    let foundPackages = false;

    // Try YAML parser first if available
    if (jsYaml && jsYaml.load) {
      try {
        const data = jsYaml.load(fs.readFileSync(file, "utf8"));

        // Parse packages section (pnpm v6+)
        if (data?.packages) {
          for (const [key, info] of Object.entries(data.packages)) {
            // Format: /package-name@version or /package-name@version(params)
            let match = key.match(/^\/(.+?)@([^@\/(]+)/);
            if (match) {
              recordPackage(match[1], match[2]);
              foundPackages = true;
            }
          }
        }
      } catch { }
    }

    // Always use regex fallback if YAML didn't find packages
    if (!foundPackages) {
      const text = fs.readFileSync(file, "utf8");
      const lines = text.split('\n');

      for (const line of lines) {
        // Look for package definitions like: /wrap-ansi@6.2.0:
        const match = line.match(/^\s*\/(.+?)@([^@\/:]+):/);
        if (match) {
          recordPackage(match[1], match[2]);
        }
      }
    }
  } catch { }
}
// Find and scan lockfiles
function scanDirectory(dir) {
  const walk = (d) => {
    const files = [];
    try {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, entry.name);
        if (entry.isDirectory() && !["node_modules", ".git"].includes(entry.name)) {
          files.push(...walk(p));
        } else if (["package-lock.json", "yarn.lock", "pnpm-lock.yaml"].includes(entry.name)) {
          files.push(p);
        }
      }
    } catch { }
    return files;
  };

  const lockfiles = walk(dir);

  for (const file of lockfiles) {
    const base = path.basename(file);
    if (base === "package-lock.json") scanNpmLock(file);
    else if (base === "yarn.lock") scanYarnLock(file);
    else if (base === "pnpm-lock.yaml") scanPnpmLock(file);
  }
}
// Run the scan
scanDirectory(dir);
// Output results
const SAFEUSED = []
const SAFEUNUSED = []
const VULNERABLE = []

console.log('Repo, Branch, Package name, Vulnerable Versions, Safe?, Used versions')
for (const target of TARGETS) {
  const versions = found.get(target.name);
  const hasTarget = versions?.intersection(target.version).size;
  const actualVersions = versions ? Array.from(versions).sort().join(";") : "-";

  const outputline = [
    repo,
    branch,
    target.name,
    Array.from(target.version).sort().join(";"),
    hasTarget ? "VULNERABLE" : "SAFE",
    actualVersions
  ].join(",")

  if (hasTarget) {
    VULNERABLE.push(outputline)
  } else {
    if (actualVersions === "-") {
      SAFEUNUSED.push(outputline)
    } else {
      SAFEUSED.push(outputline)
    }
  }

}

  // console.log('Unused Packages')
  // for (const line of SAFEUNUSED) {
  //   console.log(line);
  // }
  console.log('Used Packages (but safe)')
  for (const line of SAFEUSED) {
    console.log(line);
  }
  console.log('*******************')
  console.log('VULNERABLE Packages')
  for (const line of VULNERABLE) {
    console.log(line);
  }