
import { List, Avatar } from 'antd';

const CommentListItem = ({ item, index, actions }) => {
    return (
        <List>
            <List.Item key={item.id + '' + index} actions={actions}>
                <List.Item.Meta
                    avatar={<Avatar src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`} />}
                    title={<a href="https://ant.design">{item.author}</a>}
                    description={item.content}
                />
            </List.Item>
        </List>
    );
}









export default CommentListItem




    
