import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {postType} from './schemaTypes/postType'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
if (!projectId || projectId === 'replace-with-your-project-id') {
  throw new Error('Set SANITY_STUDIO_PROJECT_ID in studio/.env to your Sanity project ID')
}

export default defineConfig({
  name: 'field-notes',
  title: 'FIELD NOTES',
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool()],
  schema: {types: [postType]},
})
