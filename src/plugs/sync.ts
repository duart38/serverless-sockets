/*
 *   Copyright (c) 2022 Duart Snel

 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.

 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.

 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { EventType, SocketMessage } from "../interface/message.ts";
import type { ModuleGenerator } from "../interface/socketFunction.ts";
export async function* sync(_message: SocketMessage): ModuleGenerator {
  // Example of syncing objects. why send the entire message when we can just send back instructions?
  for(let i = 0; i < 50; i++){
    console.log("SYNC sending small update request");
    yield {
      event: "sync",
      type: EventType.SYNC,
      payload: {
        name: "John Doe",
        age: i * 15,
        departments: [1,2,3,4,5,6,7,8,9,0,11,22,33,44,55,66,77,88,99,111,222,333,444,555,666,777,888,999,111111],
        children: [
            {
                name: "Carl Doe",
                age: i
            },
            {
                name: "Lars Doe",
                age: i
            }
        ],
        bigString: i * 10 < 150 ? `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut convallis leo tortor, at euismod risus consequat id. Suspendisse semper ipsum eget auctor imperdiet. Cras quis ipsum eget libero tristique rhoncus in pharetra ipsum. Integer eu porttitor sapien, sed facilisis mi. Donec sed maximus lorem. Vivamus vitae lorem eget lacus iaculis pretium. Praesent euismod mauris sed tortor rutrum, sit amet luctus dui finibus. Donec neque felis, molestie in fringilla sed, mattis eget ligula. Nam sed porttitor tortor. In ut maximus ipsum.
  
        Nullam sit amet iaculis dui. Donec gravida porta metus nec scelerisque. Fusce semper euismod mauris, ut consequat arcu faucibus eu. Duis suscipit quam ac justo mattis, vitae pulvinar libero sagittis. Pellentesque ac libero vel neque eleifend venenatis. Aliquam cursus interdum enim, vitae consectetur orci consectetur quis. Proin a libero tincidunt, porttitor tellus hendrerit, maximus mi. Maecenas varius laoreet augue at posuere. Vestibulum vel turpis id arcu mattis rutrum at quis orci. Nullam lacinia nunc enim, commodo venenatis diam ornare nec. Curabitur eget pretium arcu.
        
        Cras vel hendrerit libero. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Phasellus at ante eu odio eleifend vestibulum non eget tortor. Praesent varius sodales sapien, non dignissim risus sollicitudin a. Mauris semper interdum purus a egestas. Etiam turpis magna, congue vel ligula ut, vulputate tincidunt leo. Etiam elementum nisi tristique neque egestas fermentum. Nulla facilisi. Duis non dui mi. Mauris vel lobortis velit.
        
        Quisque semper lorem at est faucibus facilisis. Praesent luctus posuere mauris sed consequat. Cras at ligula risus. Etiam erat massa, dapibus nec magna non, commodo consectetur metus. Aenean commodo nisi libero, id congue ligula aliquam at. Curabitur pulvinar, dolor nec commodo feugiat, dolor tellus auctor eros, id vestibulum ligula ligula et elit. Vestibulum fermentum odio nec magna pretium, vel efficitur leo dapibus. Cras mattis vitae augue in posuere. Integer tempor sollicitudin massa. Suspendisse maximus magna eget faucibus faucibus. Fusce porttitor pretium nunc, in blandit diam condimentum in. Integer egestas nulla eget justo condimentum pharetra.
        
        Sed scelerisque orci non nunc tempus, vitae volutpat enim condimentum. Cras et iaculis lacus. Curabitur dui nulla, efficitur eu imperdiet sed, convallis sed nibh. Ut at sodales ipsum. Sed pharetra lectus et libero tincidunt condimentum. Duis ut lacus vel leo consequat venenatis sit amet vitae massa. Suspendisse consectetur interdum lacus. Sed at libero eu lacus volutpat porta. Proin sodales neque magna, vel mattis ligula accumsan vel. Sed metus eros, tristique ut ultricies at, facilisis eget nunc. Maecenas eu leo risus. Integer congue urna felis. Quisque scelerisque ipsum ac est aliquam molestie.` : 'DELETED',
        conditionalBigString: i > 45 ? `
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut convallis leo tortor, at euismod risus consequat id. Suspendisse semper ipsum eget auctor imperdiet. Cras quis ipsum eget libero tristique rhoncus in pharetra ipsum. Integer eu porttitor sapien, sed facilisis mi. Donec sed maximus lorem. Vivamus vitae lorem eget lacus iaculis pretium. Praesent euismod mauris sed tortor rutrum, sit amet luctus dui finibus. Donec neque felis, molestie in fringilla sed, mattis eget ligula. Nam sed porttitor tortor. In ut maximus ipsum.
  
         Nullam sit amet iaculis dui. Donec gravida porta metus nec scelerisque. Fusce semper euismod mauris, ut consequat arcu faucibus eu. Duis suscipit quam ac justo mattis, vitae pulvinar libero sagittis. Pellentesque ac libero vel neque eleifend venenatis. Aliquam cursus interdum enim, vitae consectetur orci consectetur quis. Proin a libero tincidunt, porttitor tellus hendrerit, maximus mi. Maecenas varius laoreet augue at posuere. Vestibulum vel turpis id arcu mattis rutrum at quis orci. Nullam lacinia nunc enim, commodo venenatis diam ornare nec. Curabitur eget pretium arcu.
        
         Cras vel hendrerit libero. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Phasellus at ante eu odio eleifend vestibulum non eget tortor. Praesent varius sodales sapien, non dignissim risus sollicitudin a. Mauris semper interdum purus a egestas. Etiam turpis magna, congue vel ligula ut, vulputate tincidunt leo. Etiam elementum nisi tristique neque egestas fermentum. Nulla facilisi. Duis non dui mi. Mauris vel lobortis velit.
        
        Quisque semper lorem at est faucibus facilisis. Praesent luctus posuere mauris sed consequat. Cras at ligula risus. Etiam erat massa, dapibus nec magna non, commodo consectetur metus. Aenean commodo nisi libero, id congue ligula aliquam at. Curabitur pulvinar, dolor nec commodo feugiat, dolor tellus auctor eros, id vestibulum ligula ligula et elit. Vestibulum fermentum odio nec magna pretium, vel efficitur leo dapibus. Cras mattis vitae augue in posuere. Integer tempor sollicitudin massa. Suspendisse maximus magna eget faucibus faucibus. Fusce porttitor pretium nunc, in blandit diam condimentum in. Integer egestas nulla eget justo condimentum pharetra.
        
         Sed scelerisque orci non nunc tempus, vitae volutpat enim condimentum. Cras et iaculis lacus. Curabitur dui nulla, efficitur eu imperdiet sed, convallis sed nibh. Ut at sodales ipsum. Sed pharetra lectus et libero tincidunt condimentum. Duis ut lacus vel leo consequat venenatis sit amet vitae massa. Suspendisse consectetur interdum lacus. Sed at libero eu lacus volutpat porta. Proin sodales neque magna, vel mattis ligula accumsan vel. Sed metus eros, tristique ut ultricies at, facilisis eget nunc. Maecenas eu leo risus. Integer congue urna felis. Quisque scelerisque ipsum ac est aliquam molestie.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut convallis leo tortor, at euismod risus consequat id. Suspendisse semper ipsum eget auctor imperdiet. Cras quis ipsum eget libero tristique rhoncus in pharetra ipsum. Integer eu porttitor sapien, sed facilisis mi. Donec sed maximus lorem. Vivamus vitae lorem eget lacus iaculis pretium. Praesent euismod mauris sed tortor rutrum, sit amet luctus dui finibus. Donec neque felis, molestie in fringilla sed, mattis eget ligula. Nam sed porttitor tortor. In ut maximus ipsum.
  
         Nullam sit amet iaculis dui. Donec gravida porta metus nec scelerisque. Fusce semper euismod mauris, ut consequat arcu faucibus eu. Duis suscipit quam ac justo mattis, vitae pulvinar libero sagittis. Pellentesque ac libero vel neque eleifend venenatis. Aliquam cursus interdum enim, vitae consectetur orci consectetur quis. Proin a libero tincidunt, porttitor tellus hendrerit, maximus mi. Maecenas varius laoreet augue at posuere. Vestibulum vel turpis id arcu mattis rutrum at quis orci. Nullam lacinia nunc enim, commodo venenatis diam ornare nec. Curabitur eget pretium arcu.
        
        Cras vel hendrerit libero. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Phasellus at ante eu odio eleifend vestibulum non eget tortor. Praesent varius sodales sapien, non dignissim risus sollicitudin a. Mauris semper interdum purus a egestas. Etiam turpis magna, congue vel ligula ut, vulputate tincidunt leo. Etiam elementum nisi tristique neque egestas fermentum. Nulla facilisi. Duis non dui mi. Mauris vel lobortis velit.
        
        Quisque semper lorem at est faucibus facilisis. Praesent luctus posuere mauris sed consequat. Cras at ligula risus. Etiam erat massa, dapibus nec magna non, commodo consectetur metus. Aenean commodo nisi libero, id congue ligula aliquam at. Curabitur pulvinar, dolor nec commodo feugiat, dolor tellus auctor eros, id vestibulum ligula ligula et elit. Vestibulum fermentum odio nec magna pretium, vel efficitur leo dapibus. Cras mattis vitae augue in posuere. Integer tempor sollicitudin massa. Suspendisse maximus magna eget faucibus faucibus. Fusce porttitor pretium nunc, in blandit diam condimentum in. Integer egestas nulla eget justo condimentum pharetra.
        
        Sed scelerisque orci non nunc tempus, vitae volutpat enim condimentum. Cras et iaculis lacus. Curabitur dui nulla, efficitur eu imperdiet sed, convallis sed nibh. Ut at sodales ipsum. Sed pharetra lectus et libero tincidunt condimentum. Duis ut lacus vel leo consequat venenatis sit amet vitae massa. Suspendisse consectetur interdum lacus. Sed at libero eu lacus volutpat porta. Proin sodales neque magna, vel mattis ligula accumsan vel. Sed metus eros, tristique ut ultricies at, facilisis eget nunc. Maecenas eu leo risus. Integer congue urna felis. Quisque scelerisque ipsum ac est aliquam molestie.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut convallis leo tortor, at euismod risus consequat id. Suspendisse semper ipsum eget auctor imperdiet. Cras quis ipsum eget libero tristique rhoncus in pharetra ipsum. Integer eu porttitor sapien, sed facilisis mi. Donec sed maximus lorem. Vivamus vitae lorem eget lacus iaculis pretium. Praesent euismod mauris sed tortor rutrum, sit amet luctus dui finibus. Donec neque felis, molestie in fringilla sed, mattis eget ligula. Nam sed porttitor tortor. In ut maximus ipsum.
  
        Nullam sit amet iaculis dui. Donec gravida porta metus nec scelerisque. Fusce semper euismod mauris, ut consequat arcu faucibus eu. Duis suscipit quam ac justo mattis, vitae pulvinar libero sagittis. Pellentesque ac libero vel neque eleifend venenatis. Aliquam cursus interdum enim, vitae consectetur orci consectetur quis. Proin a libero tincidunt, porttitor tellus hendrerit, maximus mi. Maecenas varius laoreet augue at posuere. Vestibulum vel turpis id arcu mattis rutrum at quis orci. Nullam lacinia nunc enim, commodo venenatis diam ornare nec. Curabitur eget pretium arcu.
        
        Cras vel hendrerit libero. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Phasellus at ante eu odio eleifend vestibulum non eget tortor. Praesent varius sodales sapien, non dignissim risus sollicitudin a. Mauris semper interdum purus a egestas. Etiam turpis magna, congue vel ligula ut, vulputate tincidunt leo. Etiam elementum nisi tristique neque egestas fermentum. Nulla facilisi. Duis non dui mi. Mauris vel lobortis velit.
        
        Quisque semper lorem at est faucibus facilisis. Praesent luctus posuere mauris sed consequat. Cras at ligula risus. Etiam erat massa, dapibus nec magna non, commodo consectetur metus. Aenean commodo nisi libero, id congue ligula aliquam at. Curabitur pulvinar, dolor nec commodo feugiat, dolor tellus auctor eros, id vestibulum ligula ligula et elit. Vestibulum fermentum odio nec magna pretium, vel efficitur leo dapibus. Cras mattis vitae augue in posuere. Integer tempor sollicitudin massa. Suspendisse maximus magna eget faucibus faucibus. Fusce porttitor pretium nunc, in blandit diam condimentum in. Integer egestas nulla eget justo condimentum pharetra.
        
        Sed scelerisque orci non nunc tempus, vitae volutpat enim condimentum. Cras et iaculis lacus. Curabitur dui nulla, efficitur eu imperdiet sed, convallis sed nibh. Ut at sodales ipsum. Sed pharetra lectus et libero tincidunt condimentum. Duis ut lacus vel leo consequat venenatis sit amet vitae massa. Suspendisse consectetur interdum lacus. Sed at libero eu lacus volutpat porta. Proin sodales neque magna, vel mattis ligula accumsan vel. Sed metus eros, tristique ut ultricies at, facilisis eget nunc. Maecenas eu leo risus. Integer congue urna felis. Quisque scelerisque ipsum ac est aliquam molestie.
      ` : ''
      }
    };
  }
}
