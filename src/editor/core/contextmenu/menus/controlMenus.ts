import { INTERNAL_CONTEXT_MENU_KEY } from '../../../dataset/constant/ContextMenu'
import { EditorMode } from '../../../dataset/enum/Editor'
import { IRegisterContextMenu } from '../../../interface/contextmenu/ContextMenu'
import { Command } from '../../command/Command'
import { Dialog } from '../../../../components/dialog/Dialog'
import { ControlType } from '../../../dataset/enum/Control'
import { IElement } from '../../../interface/Element'
const {
  CONTROL: { DELETE, PROPERTIES }
} = INTERNAL_CONTEXT_MENU_KEY

export const controlMenus: IRegisterContextMenu[] = [
  {
    key: PROPERTIES,
    i18nPath: 'contextmenu.control.properties',
    when: payload => {
      return (
        !payload.isReadonly &&
        !payload.editorHasSelection &&
        !!payload.startElement?.controlId &&
        payload.options.mode !== EditorMode.FORM
      )
    },
    callback: (command: Command, context) => {
      const element = context.startElement as IElement
      const control = element.control
      if (!control) return
      
      // 根据控件类型创建不同的属性设置窗口
      let dialogData = []
      let title = ''
      
      switch (control.type) {
        case ControlType.TEXT:
          title = '文本控件'
          dialogData = [
            { type: 'text', label: '占位符', name: 'placeholder', value: control.placeholder || '' },
            { type: 'text', label: '默认值', name: 'value', value: control.value?.[0]?.value || '' }
          ]
          break
        case ControlType.SELECT:
          title = '列举控件'
          dialogData = [
            { type: 'text', label: '占位符', name: 'placeholder', value: control.placeholder || '' },
            { type: 'text', label: '默认值', name: 'value', value: control.value?.[0]?.value || '' },
            { type: 'textarea', label: '值集', name: 'valueSets', height: 100, value: JSON.stringify(control.valueSets || [], null, 2) }
          ]
          break
        case ControlType.CHECKBOX:
          title = '复选框控件'
          dialogData = [
            { type: 'text', label: '默认值', name: 'code', value: control.code || '' },
            { type: 'textarea', label: '值集', name: 'valueSets', height: 100, value: JSON.stringify(control.valueSets || [], null, 2) }
          ]
          break
        case ControlType.RADIO:
          title = '单选框控件'
          dialogData = [
            { type: 'text', label: '默认值', name: 'code', value: control.code || '' },
            { type: 'textarea', label: '值集', name: 'valueSets', height: 100, value: JSON.stringify(control.valueSets || [], null, 2) }
          ]
          break
        case ControlType.DATE:
          title = '日期控件'
          dialogData = [
            { type: 'text', label: '占位符', name: 'placeholder', value: control.placeholder || '' },
            { type: 'text', label: '默认值', name: 'value', value: control.value?.[0]?.value || '' },
            { type: 'text', label: '日期格式', name: 'dateFormat', value: control.dateFormat || 'YYYY-MM-DD' }
          ]
          break
        case ControlType.NUMBER:
          title = '数字控件'
          dialogData = [
            { type: 'text', label: '占位符', name: 'placeholder', value: control.placeholder || '' },
            { type: 'text', label: '默认值', name: 'value', value: control.value?.[0]?.value || '' },
            { type: 'number', label: '最小值', name: 'min', value: control.min?.toString() || '' },
            { type: 'number', label: '最大值', name: 'max', value: control.max?.toString() || '' },
            { type: 'number', label: '步长', name: 'step', value: control.step?.toString() || '1' }
          ]
          break
      }
      
      new Dialog({
        title,
        data: dialogData,
        onConfirm: payload => {
          const properties: any = {}
          
          payload.forEach(item => {
            if (item.name === 'valueSets') {
              try {
                properties.valueSets = JSON.parse(item.value)
              } catch (e) {
                console.error('值集格式错误', e)
              }
            } else if (item.name === 'min' || item.name === 'max' || item.name === 'step') {
              if (item.value) {
                properties[item.name] = Number(item.value)
              }
            } else {
              properties[item.name] = item.value
            }
          })
          
          // 更新控件属性
          command.executeSetControlProperties({
            id: element.controlId,
            properties
          })
        }
      })
    }
  },
  {
    key: DELETE,
    i18nPath: 'contextmenu.control.delete',
    when: payload => {
      return (
        !payload.isReadonly &&
        !payload.editorHasSelection &&
        !!payload.startElement?.controlId &&
        payload.options.mode !== EditorMode.FORM
      )
    },
    callback: (command: Command) => {
      command.executeRemoveControl()
    }
  }
]
