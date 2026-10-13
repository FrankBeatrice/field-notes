import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {postType} from './schemaTypes/postType'

// Sanity project IDs are public identifiers, not secrets.
// studio/.env can override this if moving the Studio to a different project.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'bu13olof'

export default defineConfig({
  name: 'field-notes',
  title: 'FIELD NOTES',
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool()],
  schema: {types: [postType]},
})
