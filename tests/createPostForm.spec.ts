import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CreatePostForm from '../src/components/CreatePostForm.vue'

describe('CreatePostForm', () => {
  it('renders values and emits update events', async () => {
    const wrapper = mount(CreatePostForm, {
      props: {
        userId: 1,
        title: 'Título',
        body: 'Conteúdo',
        isPending: false,
        canSubmit: true,
      },
    })

    const inputs = wrapper.findAll('input')
    const textarea = wrapper.find('textarea')

    await inputs[0].setValue('2')
    await inputs[1].setValue('Novo título')
    await textarea.setValue('Novo conteúdo')

    expect(wrapper.emitted('update-user-id')?.[0]).toEqual([2])
    expect(wrapper.emitted('update-title')?.[0]).toEqual(['Novo título'])
    expect(wrapper.emitted('update-body')?.[0]).toEqual(['Novo conteúdo'])
  })

  it('disables submit when pending and can emit after enabling', async () => {
    const wrapper = mount(CreatePostForm, {
      props: {
        userId: 1,
        title: '',
        body: '',
        isPending: true,
        canSubmit: false,
      },
    })

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.text()).toContain('Salvando...')

    await button.trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.setProps({ isPending: false, canSubmit: true })
    await button.trigger('click')
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })
})
