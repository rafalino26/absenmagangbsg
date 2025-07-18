
/* !!! This is code generated by Prisma. Do not edit directly. !!!
/* eslint-disable */

Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime,
  createParam,
} = require('./runtime/wasm-engine-edge.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.12.0
 * Query Engine version: 8047c96bbd92db98a2abc7c9323ce77c02c89dbc
 */
Prisma.prismaVersion = {
  client: "6.12.0",
  engine: "8047c96bbd92db98a2abc7c9323ce77c02c89dbc"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  password: 'password',
  role: 'role',
  division: 'division',
  periodStartDate: 'periodStartDate',
  periodEndDate: 'periodEndDate',
  bankName: 'bankName',
  accountNumber: 'accountNumber',
  profilePicUrl: 'profilePicUrl',
  phoneNumber: 'phoneNumber',
  joinDate: 'joinDate',
  isActive: 'isActive'
};

exports.Prisma.AttendanceScalarFieldEnum = {
  id: 'id',
  type: 'type',
  timestamp: 'timestamp',
  description: 'description',
  photoUrl: 'photoUrl',
  latitude: 'latitude',
  longitude: 'longitude',
  isLate: 'isLate',
  userId: 'userId'
};

exports.Prisma.HelpdeskTicketScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  description: 'description',
  proofUrl: 'proofUrl',
  status: 'status',
  userId: 'userId'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  Attendance: 'Attendance',
  HelpdeskTicket: 'HelpdeskTicket'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "edge_client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\test\\absen-magang\\supabase\\functions\\_shared\\prisma-client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [
      "driverAdapters"
    ],
    "sourceFilePath": "C:\\Users\\test\\absen-magang\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../../.env"
  },
  "relativePath": "../../../../prisma",
  "clientVersion": "6.12.0",
  "engineVersion": "8047c96bbd92db98a2abc7c9323ce77c02c89dbc",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\ngenerator client {\n  provider = \"prisma-client-js\"\n}\n\ngenerator edge_client {\n  provider        = \"prisma-client-js\"\n  previewFeatures = [\"driverAdapters\"]\n  output          = \"../supabase/functions/_shared/prisma-client\"\n}\n\ndatasource db {\n  provider  = \"postgresql\"\n  url       = env(\"DATABASE_URL\")\n  directUrl = env(\"DATABASE_URL_DIRECT\")\n}\n\nmodel User {\n  id              Int       @id @default(autoincrement())\n  name            String\n  email           String?   @unique\n  password        String\n  role            String    @default(\"INTERN\")\n  division        String\n  periodStartDate DateTime?\n  periodEndDate   DateTime?\n  bankName        String?\n  accountNumber   String?\n  profilePicUrl   String?\n  phoneNumber     String?\n  joinDate        DateTime  @default(now())\n  isActive        Boolean   @default(true)\n\n  attendances     Attendance[]\n  helpdeskTickets HelpdeskTicket[]\n}\n\nmodel Attendance {\n  id          Int      @id @default(autoincrement())\n  type        String\n  timestamp   DateTime @default(now()) // Waktu saat data dibuat\n  description String\n  photoUrl    String?\n  latitude    Float?\n  longitude   Float?\n  isLate      Boolean  @default(false)\n  userId      Int\n  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n}\n\nmodel HelpdeskTicket {\n  id          Int      @id @default(autoincrement())\n  createdAt   DateTime @default(now())\n  description String   @db.Text // @db.Text untuk teks yang panjang\n  proofUrl    String?\n  status      String   @default(\"OPEN\") // Status bisa: OPEN, IN_PROGRESS, RESOLVED\n  userId      Int\n  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n}\n",
  "inlineSchemaHash": "4fdda4e2f651a75be33b46daf9880528bb0e4af335506540ebacd005a3d0e2f4",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"division\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"periodStartDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"periodEndDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"bankName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"accountNumber\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"profilePicUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"phoneNumber\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"joinDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"isActive\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"attendances\",\"kind\":\"object\",\"type\":\"Attendance\",\"relationName\":\"AttendanceToUser\"},{\"name\":\"helpdeskTickets\",\"kind\":\"object\",\"type\":\"HelpdeskTicket\",\"relationName\":\"HelpdeskTicketToUser\"}],\"dbName\":null},\"Attendance\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"photoUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"latitude\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"longitude\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"isLate\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"AttendanceToUser\"}],\"dbName\":null},\"HelpdeskTicket\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"proofUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"HelpdeskTicketToUser\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = {
  getRuntime: async () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine
  }
}
config.compilerWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

