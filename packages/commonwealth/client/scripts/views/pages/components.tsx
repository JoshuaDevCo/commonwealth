import React from 'react';

import { ClassComponent } from 'mithrilInterop';
import Sublayout from 'views/sublayout';
import { ComponentShowcase } from '../components/component_kit/cw_component_showcase';

class ComponentsPage extends ClassComponent {
  view() {
    return (
      <Sublayout>
        <ComponentShowcase />
      </Sublayout>
    );
  }
}

export default ComponentsPage;
