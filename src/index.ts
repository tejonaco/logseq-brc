import '@logseq/libs'
import { BlockEntity, BlockUUID } from '@logseq/libs/dist/LSPlugin.user'

const REF_REGEXP = /\(\(((?:[\w\d]+-)+[\w\d]+)\)\)/

async function contextReference (content: string, uuid: BlockUUID): Promise<void> {
  const match = REF_REGEXP.exec(content)

  if (match != null) {
    console.log(match)
    const refUUID: string = match[1]
    const ref = await logseq.Editor.getBlock(refUUID)

    if (ref != null) {
      const refContent = ref.content.split('\nid::')[0]
      const newContent = content.replace(`((${refUUID}))`, `[${refContent}](${refUUID})`)

      await logseq.Editor.updateBlock(uuid, newContent)

      await contextReference(newContent, uuid)
    }
  }
}
async function main (): Promise<void> {
  await logseq.Editor.registerSlashCommand(
    'Block Reference Context',
    async () => {
      const block = await logseq.Editor.getCurrentBlock() as BlockEntity
      await contextReference(block.content, block.uuid)
    }
  )
}

// bootstrap
logseq.ready(main).catch(console.error)
