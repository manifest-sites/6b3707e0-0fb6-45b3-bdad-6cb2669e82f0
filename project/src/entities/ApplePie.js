import { createEntityClient } from "../utils/entityWrapper";
import schema from "./ApplePie.json";
export const ApplePie = createEntityClient("ApplePie", schema);
