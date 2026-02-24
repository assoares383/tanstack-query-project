import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EditPostForm from '../src/components/EditPostForm.vue'

describe('EditPostForm', () => {
  it('renders values and emits update events', async () => {
    const wrapper = mount(EditPostForm, {
      props: {
        title: 'T1',
        body: 'B1',
        isPending: false,
        canSubmit: true,
      },
    })

    const input = wrapper.find('input')
    const textarea = wrapper.find('textarea')

    await input.setValue('T2')
    await textarea.setValue('B2')

    expect(wrapper.emitted('update-title')?.[0]).toEqual(['T2'])
    expect(wrapper.emitted('update-body')?.[0]).toEqual(['B2'])
  })

  it('respects disabled submit and emits after enabling', async () => {
    const wrapper = mount(EditPostForm, {
      props: {
        title: 'T1',
        body: 'B1',
        isPending: true,
        canSubmit: false,
      },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('disabled')).toBeDefined()
    expect(buttons[0].text()).toContain('Salvando...')

    await buttons[0].trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.setProps({ isPending: false, canSubmit: true })
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')

    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
