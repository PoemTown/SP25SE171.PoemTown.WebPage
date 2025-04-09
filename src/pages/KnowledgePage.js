import React from 'react';
import { Collapse, Typography, Layout, Card, theme } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Headeruser from '../components/Headeruser';
import Headerdefault from '../components/Headerdefault';

const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

const poetryTypes = [
    {
        title: "Thơ Tự Do",
        description: "Thơ Tự Do là thể thơ không bị ràng buộc bởi các quy tắc cố định về số chữ, vần điệu hay nhịp thơ. Người viết có thể sáng tạo cấu trúc tùy ý để biểu đạt cảm xúc cá nhân, ý tưởng triết lý, hoặc phản ánh hiện thực xã hội.",
        color: "#1890ff",
        example: {
            title: "Đất Nước - Nguyễn Khoa Điềm",
            content: `Khi ta lớn lên Đất Nước đã có rồi\nĐất Nước có trong những cái "ngày xửa ngày xưa..." mẹ thường hay kể\nĐất Nước bắt đầu với miếng trầu bây giờ bà ăn\nĐất Nước lớn lên khi dân mình biết trồng tre mà đánh giặc\n\nTóc mẹ thì bới sau đầu\nCha mẹ thương nhau bằng gừng cay muối mặn\nCái kèo, cái cột thành tên\nHạt gạo phải một nắng hai sương xay, giã, giần, sàng\nĐất Nước có từ ngày đó...`
        }
    },
    {
        title: "Thơ Lục Bát",
        description: "Thơ Lục Bát là thể thơ dân tộc đặc trưng của Việt Nam, gồm hai câu: một câu 6 chữ và một câu 8 chữ, nối tiếp nhau tạo thành chuỗi.",
        color: "#52c41a",
        example: {
            title: "Tương tư - Nguyễn Bính",
            content: `Thôn Đoài ngồi nhớ thôn Đông,\nMột người chín nhớ mười mong một người.\nGió mưa là bệnh của giời,\nTương tư là bệnh của tôi yêu nàng.\nHai thôn chung lại một làng,\nCớ sao bên ấy chẳng sang bên này?\nNgày qua ngày lại qua ngày,\nLá xanh nhuộm đã thành cây lá vàng.\nBảo rằng cách trở đò giang,\nKhông sang là chẳng đường sang đã đành.\nNhưng đây cách một đầu đình,\nCó xa xôi mấy mà tình xa xôi...\n\nTương tư thức mấy đêm rồi,\nBiết cho ai, hỏi ai người biết cho!\nBao giờ bến mới gặp đò?\nHoa khuê các bướm giang hồ gặp nhau?\n\nNhà em có một giàn giầu,\nNhà anh có một hàng cau liên phòng.\nThôn Đoài thì nhớ thôn Đông,\nCau thôn Đoài nhớ giầu không thôn nào?`
        }
    },
    {
        title: "Thơ Song Thất Lục Bát",
        description: "Thể thơ này gồm bốn câu: hai câu đầu mỗi câu 7 chữ (song thất), tiếp theo là một câu 6 chữ và một câu 8 chữ (lục bát).",
        color: "#faad14",
        example: {
            title: "Cung Oán Ngâm Khúc - Nguyễn Gia Thiều",
            content: `Đòi những kẻ thiên ma bách chiết\nHình thì còn bụng chết đòi nau\nThảo nào khi mới chôn nhau\nĐã mang tiếng khóc ban đầu mà ra!\nKhóc vì nỗi thiết tha sự thế\nAi bày trò bãi bể nương dâu\nTrắng răng đến thuở bạc đầu\nTử, sinh, kinh, cụ làm nau mấy lần.`
        }
    },
    {
        title: "Thơ Thất Ngôn Tứ Tuyệt",
        description: "Gồm 4 câu, mỗi câu 7 chữ. Là một dạng của thơ Đường luật, nổi bật bởi sự ngắn gọn, súc tích.",
        color: "#f5222d",
        example: {
            title: "Qua Đèo Ngang - Bà Huyện Thanh Quan",
            content: `Bước tới Đèo Ngang bóng xế tà\nCỏ cây chen đá lá chen hoa\nLom khom dưới núi tiều vài chú\nLác đác bên sông chợ mấy nhà`
        }
    },
    {
        title: "Thơ Ngũ Ngôn Tứ Tuyệt",
        description: "Là thể thơ cổ gồm 4 câu, mỗi câu 5 chữ. Thường ngắn gọn nhưng hàm chứa nội dung sâu sắc.",
        color: "#722ed1",
        example: {
            title: "Chạng Vạng",
            content: `Đầu non mây tụ tán\nLưng trời mây thong dong\nTỉnh - say, đời chạng vạng\nMắt xanh nhìn bụi hồng.`
        }
    },
    {
        title: "Thơ Thất Ngôn Bát Cú",
        description: "Thơ Thất Ngôn Bát Cú gồm 8 câu, mỗi câu 7 chữ, là một trong những thể thơ Đường luật tiêu biểu.",
        color: "#13c2c2",
        example: {
            title: "Lục Bình Trôi",
            content: `Thân em tắm gội giữa dòng sông\nMột thuở lênh đênh đượm ngát nồng\nHoa tím bồng bềnh mùa nước nổi\nBèo xanh nghiêng ngã dưới cơn giông\n\nNghĩ thương buổi sớm còn chờ đón\nTủi kiếp ban chiều hết ngóng trông\nNắng táp mưa sa đời phận bạc\nLục Bình trôi mãi vẫn long đong`
        }
    },
    {
        title: "Thơ 4 Chữ",
        description: "Thơ 4 chữ là thể thơ đơn giản, mỗi câu gồm 4 âm tiết. Có nhịp điệu nhanh, dễ thuộc.",
        color: "#eb2f96",
        example: {
            title: "Đồng Dao",
            content: `Nu na nu nống\nCái cống nằm trong\nCái ong nằm ngoài\nCủ khoai chấm mật\n\nBụt ngồi bụt khóc\nCon cóc nhảy ra\nCon gà ú ụ\nBà mụ thổi xôi`
        }
    },
    {
        title: "Thơ 5 Chữ",
        description: "Mỗi câu gồm 5 chữ, có thể có các nhịp phổ biến như 2-3 hoặc 3-2.",
        color: "#fa8c16",
        example: {
            title: "Ánh Trăng - Nguyễn Duy",
            content: `Hồi nhỏ sống với đồng\nvới sông rồi với bể\nhồi chiến tranh ở rừng\nvầng trăng thành tri kỷ\n\nTrần trụi với thiên nhiên\nhồn nhiên như cây cỏ\nngỡ không bao giờ quên\ncái vầng trăng tình nghĩa`
        }
    },
    {
        title: "Thơ 6 Chữ",
        description: "Gồm các câu 6 chữ, nhịp điệu thường chia theo kiểu 3-3 hoặc 2-2-2, tạo sự uyển chuyển, nhịp nhàng.",
        color: "#a0d911",
        example: {
            title: " Anh đừng khen em - Lâm Thị Mỹ Dạ",
            content: `Lần đầu khi mới làm quen\nAnh khen cái nhìn em đẹp\nTrời mưa òa cơn nắng đến\nAnh khen đôi má em hồng\n\nGặp người tàn tật em khóc\nAnh khen em nhạy cảm thông\nThấy em sợ sét né giông\nAnh khen sao mà hiền thế!\n... 
            `
        }
    },
    {
        title: "Thơ 7 Chữ",
        description: "Mỗi câu có 7 chữ, thường xuất hiện trong thể thơ thất ngôn.",
        color: "#2f54eb",
        example: {
            title: "Bình Yên - Huy Cận",
            content: `Thời khắc đang đi nhịp thái bình\nDịu dàng gió nhạt thổi mây xanh\nHàng cây mở ngọn kêu chim đến\nHạnh phúc xem như chuyện đã đành\n\nLẩn cụm hoa trời rơi dáng bướm\nNỡ chen hoa lá tiếng vành khuyên\nNgoài đường buổi sáng thơm hương mới\nThú sống thơm mùi cỏ mới lên\n\nKia treo trái mộng trĩu cây đời\nNgang với tầm tay ngắn của người\nNhưng múa vu vơ tay đã mỏi\nÊ chề đời thoảng vị cơm ôi…`
        }
    },
    {
        title: "Thơ 8 Chữ",
        description: "Thơ 8 chữ có cấu trúc mỗi câu 8 âm tiết, thường ít bị ràng buộc bởi luật thơ, mang tính tự do hơn.",
        color: "#d4380d",
        example: {
            title: "Đời người đâu mấy lần vui - Tùng Trần",
            content: `Kiếp con người mỏng manh như là gió\nSống trên đời có được mấy lần vui\nSao phải đau mà không thể mĩm cười\nGắng buông nỗi ngậm ngùi nơi quá khứ\n\nNếu có thể sao ta không làm thử\nĐể tâm hồn khắc hai chữ bình an\nCho đôi chân buớc thanh thản nhẹ nhàng\nDù hướng đời có muôn ngàn đá sỏi...`
        }
    }
];

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  border: none;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const PoetryTypeHeader = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;

  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 24px;
    background: ${props => props.color};
    margin-right: 12px;
    border-radius: 4px;
  }
`;

const ExampleContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: ${props => props.theme.token?.colorFillAlter};
  border-radius: 8px;
  border-left: 3px solid ${props => props.color};
`;

const PoemText = styled.pre`
  font-family: inherit;
  white-space: pre-wrap;
  margin: 0;
  font-style: italic;
  color: ${props => props.theme.token?.colorTextSecondary};
  line-height: 1.8;
`;

const KnowledgePage = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const isLoggedIn = !!localStorage.getItem('accessToken');

    return (
        <div style={{ background: '#f5f7fa' }}>
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}
            <Layout style={{ padding: '24px', minHeight: '100vh', background: '#f5f7fa' }}>
                <Content style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <Card
                        style={{
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                            marginBottom: 24,
                            textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                        }}
                        bordered={false}
                    >
                        <Title level={2} style={{ marginBottom: 0 }}>
                            <BookOutlined style={{
                                marginRight: 12,
                                color: '#722ed1',
                                fontSize: '28px'
                            }} />
                            <Text style={{
                                background: 'linear-gradient(90deg, #1890ff, #722ed1)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: 600
                            }}>
                                Các Thể Loại Thơ Cơ Bản
                            </Text>
                        </Title>
                        <Paragraph type="secondary" style={{ marginTop: 8 }}>
                            Khám phá các thể thơ truyền thống và hiện đại của Việt Nam
                        </Paragraph>
                    </Card>

                    <Collapse
                        accordion
                        bordered={false}
                        expandIconPosition="end"
                        style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}
                    >
                        {poetryTypes.map((type, index) => (
                            <Panel
                                header={
                                    <PoetryTypeHeader color={type.color}>
                                        {type.title}
                                    </PoetryTypeHeader>
                                }
                                key={index}
                                style={{
                                    borderLeft: `4px solid ${type.color}`,
                                    marginBottom: 8,
                                    borderRadius: 8,
                                    overflow: 'hidden'
                                }}
                            >
                                <Paragraph style={{ margin: 0, paddingLeft: 20 }}>
                                    {type.description}
                                </Paragraph>
                                
                                {type.example && (
                                    <ExampleContainer color={type.color}>
                                        <Text strong>Ví dụ: {type.example.title}</Text>
                                        <PoemText>{type.example.content}</PoemText>
                                    </ExampleContainer>
                                )}
                            </Panel>
                        ))}
                    </Collapse>

                    <div style={{ marginTop: 24 }}>
                        <Title level={4} style={{ color: '#595959' }}>Mẹo làm thơ</Title>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            <StyledCard>
                                <Text strong>Chọn thể loại phù hợp</Text>
                                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                                    Mỗi thể thơ có đặc điểm riêng, chọn thể loại phù hợp với nội dung muốn truyền tải.
                                </Paragraph>
                            </StyledCard>
                            <StyledCard>
                                <Text strong>Chú ý vần điệu</Text>
                                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                                    Vần điệu giúp bài thơ dễ đọc, dễ nhớ và có nhạc tính.
                                </Paragraph>
                            </StyledCard>
                            <StyledCard>
                                <Text strong>Kiểm tra số chữ</Text>
                                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                                    Đảm bảo đúng số chữ quy định của thể thơ bạn chọn.
                                </Paragraph>
                            </StyledCard>
                        </div>
                    </div>
                </Content>
            </Layout>
        </div>
    );
};

export default KnowledgePage;